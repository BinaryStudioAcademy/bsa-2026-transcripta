import {
	DocumentStatus,
	EMPTY_LENGTH,
	HTTPCode,
	PageStatus,
} from "@transcripta/shared";
import { type Job } from "bullmq";
import { type Transaction } from "objection";

import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";
import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";
import { buildContext } from "~/modules/context/builder.js";
import { buildUserPrompt } from "~/modules/context/prompt.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { PAGES_TO_QUEUE } from "~/modules/documents/libs/constants/constants.js";
import { refillPageWindow } from "~/modules/pages/libs/helpers/helpers.js";
import { type PageEntity } from "~/modules/pages/page.entity.js";
import { PageModel } from "~/modules/pages/page.model.js";
import { PresetModel } from "~/modules/presets/preset.model.js";
import {
	calculateTokenCost,
	createOutputValidator,
	resolveModelProvider,
} from "~/modules/transcription/libs/helpers/helpers.js";
import { type TranscriptionResponse } from "~/modules/transcription/libs/types/types.js";
import { TranscriptionCacheModel } from "~/modules/transcription/transcription-cache.model.js";

import {
	MAX_REPAIR_ATTEMPTS,
	MAX_RETRYABLE_HTTP_CODE,
	MAX_TRANSCRIBE_ATTEMPTS,
	ONE,
	PAGE_MEDIA_TYPE,
	RETRYABLE_ERROR_NAMES,
	TRANSCRIBABLE_STATUSES,
} from "./libs/constants/constants.js";
import { PageEventName, TranscribeFailureReason } from "./libs/enums/enums.js";
import {
	buildCacheKey,
	buildPresetHash,
	stripCodeFence,
} from "./libs/helpers/helpers.js";
import {
	type CallOutcome,
	type Dependencies,
	type FailedResolvedTranscription,
	type ParseResult,
	type RecordFailureOptions,
	type ResolvedTranscription,
	type ResolveOptions,
	type StoreOptions,
	type TranscribeFailureReasonValue,
	type TranscribeRequestOptions,
} from "./libs/types/types.js";

const parseModelJson = (text: string): ParseResult => {
	try {
		return { ok: true, value: JSON.parse(text) };
	} catch {
		return { ok: false };
	}
};

const formatValidationErrors = (
	errors: Array<{
		instancePath: string;
		message?: string;
	}>,
): string =>
	errors
		.map(
			(error) => `${error.instancePath || "/"} ${error.message ?? "invalid"}`,
		)
		.join("; ");

const finalizePageFailure = async (
	{
		documentId,
		documentRepository,
		pageRepository,
	}: Pick<
		RecordFailureOptions,
		"documentId" | "documentRepository" | "pageRepository"
	>,
	trx: Transaction,
): Promise<PageEntity[]> => {
	const pages = await refillPageWindow({
		documentId,
		pageRepository,
		quantity: PAGES_TO_QUEUE,
		trx,
	});
	await documentRepository.markDoneIfAllPagesClosed(documentId, trx);

	return pages;
};

const enqueuePages = async (
	pages: PageEntity[],
	enqueuePage: Dependencies["enqueuePage"],
): Promise<void> => {
	await Promise.all(
		pages.map((page) => {
			const { documentId, id, pageNo } = page.toObject();

			return enqueuePage({ documentId, pageId: id, pageNo });
		}),
	);
};

const recordFailure = async ({
	documentId,
	documentRepository,
	enqueuePage,
	event,
	pageId,
	pageRepository,
	reason,
}: RecordFailureOptions): Promise<void> => {
	const pages = await DocumentModel.transaction(async (trx) => {
		const document = await DocumentModel.query(trx)
			.findById(documentId)
			.forUpdate();

		if (!document) {
			return [];
		}

		const failedRows = await PageModel.query(trx)
			.patch({
				attempts: trx.raw("attempts + ?", [ONE]),
				lastError: reason,
				status: PageStatus.FAILED,
			})
			.where({ documentId, id: pageId, status: PageStatus.TRANSCRIBING })
			.execute();

		if (failedRows === EMPTY_LENGTH) {
			return [];
		}

		if (event) {
			await trx.from(DatabaseTableName.PAGE_EVENT).insert({
				actorId: null,
				details: event.details,
				documentId,
				durationMs: event.durationMs,
				event: PageEventName.TRANSCRIBE_FAILED,
				pageId,
				transcriptionId: null,
			});
		}

		return await finalizePageFailure(
			{ documentId, documentRepository, pageRepository },
			trx,
		);
	});

	await enqueuePages(pages, enqueuePage);
};

const markDocumentStopped = async (documentId: number): Promise<void> => {
	await DocumentModel.query()
		.patch({ status: DocumentStatus.BUDGET_STOP })
		.where("id", documentId)
		.execute();
};

const isBudgetExhausted = (document: {
	budgetUsd: string;
	spentUsd: string;
}): boolean => Number(document.spentUsd) >= Number(document.budgetUsd);

const transcribeWithRepair = async (
	options: TranscribeRequestOptions,
): Promise<CallOutcome> => {
	const {
		image,
		logger,
		mediaType,
		modelId,
		outputSchema,
		pageId,
		prompt,
		transcriptionService,
	} = options;

	let repairNote: string | undefined;
	let usedInputTokens = EMPTY_LENGTH;
	let usedLatencyMs = EMPTY_LENGTH;
	let usedOutputTokens = EMPTY_LENGTH;

	const createFailureOutcome = (
		reason: TranscribeFailureReasonValue,
		retryable = false,
	): CallOutcome => ({
		inputTokens: usedInputTokens,
		latencyMs: usedLatencyMs,
		ok: false,
		outputTokens: usedOutputTokens,
		reason,
		retryable,
	});

	for (let attempt = EMPTY_LENGTH; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
		const requestPrompt = repairNote
			? `${prompt}\n\nYour previous output failed the schema. Fix it:\n${repairNote}`
			: prompt;
		let response: TranscriptionResponse;

		try {
			response = await transcriptionService.transcribe({
				image,
				mediaType,
				modelId,
				prompt: requestPrompt,
			});
		} catch (error) {
			logger.error(`Model call failed for page ${String(pageId)}`, { error });

			return createFailureOutcome(
				TranscribeFailureReason.MODEL_CALL_FAILED,
				errorIsRetryable(error),
			);
		}

		usedInputTokens += response.usage.inputTokens;
		usedLatencyMs += response.latencyMs;
		usedOutputTokens += response.usage.outputTokens;

		const responseText = stripCodeFence(response.text);
		const parsed = parseModelJson(responseText);

		if (!parsed.ok) {
			if (attempt >= MAX_REPAIR_ATTEMPTS) {
				return createFailureOutcome(
					TranscribeFailureReason.INVALID_MODEL_OUTPUT,
				);
			}

			repairNote = "Your previous output was not valid JSON.";
			continue;
		}

		const result = createOutputValidator(outputSchema ?? {})(parsed.value);

		if (result.valid) {
			return {
				inputTokens: usedInputTokens,
				latencyMs: usedLatencyMs,
				ok: true,
				outputTokens: usedOutputTokens,
				structured: parsed.value,
				text: responseText,
			};
		}

		if (attempt >= MAX_REPAIR_ATTEMPTS) {
			return createFailureOutcome(TranscribeFailureReason.INVALID_MODEL_OUTPUT);
		}

		repairNote = formatValidationErrors(result.errors ?? []);
	}

	return createFailureOutcome(TranscribeFailureReason.INVALID_MODEL_OUTPUT);
};

const resolveFromCacheOrModel = async (
	options: ResolveOptions,
): Promise<null | ResolvedTranscription> => {
	const { cacheKey, context, page, preset } = options;

	const cached = await TranscriptionCacheModel.query()
		.findById(cacheKey)
		.execute();

	if (cached) {
		const structured = cached.structured ?? null;

		await TranscriptionCacheModel.query()
			.patch({
				hitCount: AbstractModel.knex().raw("hit_count + ?", [ONE]),
				lastHitAt: new Date().toISOString(),
			})
			.where("cache_key", cacheKey)
			.execute();

		return {
			costUsd: EMPTY_LENGTH,
			fromCache: true,
			inputTokens: cached.inputTokens,
			latencyMs: EMPTY_LENGTH,
			ok: true,
			outputTokens: cached.outputTokens,
			structured,
			text: cached.text,
		};
	}

	if (!page.imageKey) {
		return null;
	}

	const { logger, modelId, storage, transcriptionService } = options;

	const image = await storage.downloadPageImage(page.imageKey);
	const userPrompt = buildUserPrompt(preset, context.blocks);

	const outcome = await transcribeWithRepair({
		image,
		logger,
		mediaType: PAGE_MEDIA_TYPE,
		modelId,
		outputSchema: preset.outputSchema,
		pageId: page.id,
		prompt: userPrompt,
		transcriptionService,
	});

	const costUsd = calculateTokenCost({
		inputTokens: outcome.inputTokens,
		modelId,
		outputTokens: outcome.outputTokens,
	});

	if (outcome.ok) {
		return {
			costUsd,
			fromCache: false,
			inputTokens: outcome.inputTokens,
			latencyMs: outcome.latencyMs,
			ok: true,
			outputTokens: outcome.outputTokens,
			structured: outcome.structured,
			text: outcome.text,
		};
	}

	return {
		costUsd,
		fromCache: false,
		inputTokens: outcome.inputTokens,
		latencyMs: outcome.latencyMs,
		ok: false,
		outputTokens: outcome.outputTokens,
		reason: outcome.reason,
		retryable: outcome.retryable,
	};
};

const storeTranscription = async (options: StoreOptions): Promise<void> => {
	const {
		contextUsed,
		costUsd,
		documentId,
		fromCache,
		inputTokens,
		latencyMs,
		modelId,
		outputTokens,
		pageId,
		presetId,
		provider,
		structured,
		text,
	} = options;

	await DocumentModel.transaction(async (trx) => {
		await trx
			.from(DatabaseTableName.TRANSCRIPTION)
			.where("page_id", pageId)
			.where("is_current", true)
			.update({ is_current: false });

		await trx.from(DatabaseTableName.TRANSCRIPTION).insert({
			context_used: contextUsed,
			cost_usd: costUsd,
			document_id: documentId,
			from_cache: fromCache,
			input_tokens: inputTokens,
			latency_ms: latencyMs,
			model: modelId,
			output_tokens: outputTokens,
			page_id: pageId,
			preset_id: presetId,
			provider,
			structured: structured ?? null,
			text,
		});

		await trx.raw(
			`UPDATE ${DatabaseTableName.DOCUMENT} SET spent_usd = spent_usd + ? WHERE id = ?`,
			[costUsd, documentId],
		);

		await trx.from(DatabaseTableName.PAGE).where("id", pageId).update({
			lastError: null,
			status: PageStatus.TRANSCRIBED,
		});
	});
};

const applyBudgetStopIfExceeded = async (
	documentId: number,
	trx?: Transaction,
): Promise<boolean> => {
	const affectedRows = await DocumentModel.query(trx)
		.patch({ status: DocumentStatus.BUDGET_STOP })
		.where("id", documentId)
		.whereNot("status", DocumentStatus.BUDGET_STOP)
		.whereRaw("spent_usd >= budget_usd");

	if (affectedRows > EMPTY_LENGTH) {
		return true;
	}

	const document = await DocumentModel.query(trx)
		.select("status")
		.findById(documentId);

	return document?.status === DocumentStatus.BUDGET_STOP;
};

const releaseClaimedPage = async ({
	documentId,
	documentRepository,
	enqueuePage,
	error,
	logger,
	pageId,
	pageRepository,
}: Pick<
	Dependencies,
	"documentRepository" | "enqueuePage" | "logger" | "pageRepository"
> & {
	documentId: number;
	error: unknown;
	pageId: number;
}): Promise<void> => {
	try {
		await recordFailure({
			documentId,
			documentRepository,
			enqueuePage,
			event: {
				details: {
					error: TranscribeFailureReason.UNEXPECTED_ERROR,
					message: error instanceof Error ? error.message : String(error),
				},
				durationMs: EMPTY_LENGTH,
			},
			pageId,
			pageRepository,
			reason: TranscribeFailureReason.UNEXPECTED_ERROR,
		});
	} catch (releaseError) {
		logger.error(`Failed to release claimed page ${String(pageId)}`, {
			error: releaseError,
		});
	}
};

const createTranscribeHandler =
	({
		config,
		documentRepository,
		enqueuePage,
		enqueueRetry,
		logger,
		pageRepository,
		storage,
		transcriptionService,
	}: Dependencies) =>
	async (job: Job<PageTranscribeJobData>): Promise<void> => {
		const { documentId, pageId, pageNo } = job.data;

		const document = await DocumentModel.query().findById(documentId);
		const page = await PageModel.query().findById(pageId);

		if (!document || !page || !TRANSCRIBABLE_STATUSES.has(document.status)) {
			logger.info(
				`Skip page.transcribe ${String(pageId)}: document not transcribing`,
				{ documentStatus: document?.status },
			);
			return;
		}

		const claimedRows = await PageModel.query()
			.patch({ status: PageStatus.TRANSCRIBING })
			.where({
				id: pageId,
				status: PageStatus.QUEUED,
			})
			.execute();

		if (claimedRows === EMPTY_LENGTH) {
			logger.info(
				`Skip page.transcribe ${String(pageId)}: page already claimed or no longer queued`,
			);

			return;
		}

		try {
			await DocumentModel.query()
				.patch({ status: DocumentStatus.PROCESSING })
				.where({ id: documentId, status: DocumentStatus.READY })
				.execute();

			if (isBudgetExhausted(document)) {
				logger.warn(`Budget exhausted for document ${String(documentId)}`);

				await DocumentModel.transaction(async (trx) => {
					await trx.from(DatabaseTableName.PAGE_EVENT).insert({
						actorId: null,
						details: {
							budgetUsd: document.budgetUsd,
							error: TranscribeFailureReason.BUDGET_EXCEEDED,
							spentUsd: document.spentUsd,
						},
						documentId,
						durationMs: EMPTY_LENGTH,
						event: PageEventName.TRANSCRIBE_FAILED,
						pageId,
						transcriptionId: null,
					});

					await trx.from(DatabaseTableName.PAGE).where("id", pageId).update({
						status: PageStatus.QUEUED,
					});
				});

				await markDocumentStopped(documentId);
				return;
			}

			const preset = await PresetModel.query().findById(document.presetId);

			if (!preset) {
				await recordFailure({
					documentId,
					documentRepository,
					enqueuePage,
					pageId,
					pageRepository,
					reason: TranscribeFailureReason.PRESET_NOT_FOUND,
				});
				return;
			}

			const modelId = config.ENV.BEDROCK.MODEL_ID;
			const knex = AbstractModel.knex();
			const context = await buildContext({
				documentId,
				knex,
				logger,
				pageNo,
				preset,
			});

			if (!page.imageSha256) {
				await recordFailure({
					documentId,
					documentRepository,
					enqueuePage,
					pageId,
					pageRepository,
					reason: TranscribeFailureReason.PAGE_IMAGE_SHA_MISSING,
				});
				return;
			}

			const cacheKey = buildCacheKey({
				contextHash: context.contextHash,
				imageSha256: page.imageSha256,
				modelId,
				presetHash: buildPresetHash({
					id: preset.id,
					instructions: preset.instructions,
					outputSchema: preset.outputSchema,
					seedGlossary: preset.seedGlossary,
					settings: preset.settings,
				}),
			});

			const resolved = await resolveFromCacheOrModel({
				cacheKey,
				config,
				context,
				documentId,
				logger,
				modelId,
				page,
				pageNo,
				preset,
				storage,
				transcriptionService,
			});

			if (!resolved) {
				await recordFailure({
					documentId,
					documentRepository,
					enqueuePage,
					pageId,
					pageRepository,
					reason: TranscribeFailureReason.PAGE_IMAGE_MISSING,
				});
				return;
			}

			if (!resolved.ok) {
				await handleFailedTranscription({
					documentId,
					documentRepository,
					enqueuePage,
					enqueueRetry,
					jobData: job.data,
					logger,
					pageAttempts: page.attempts,
					pageId,
					pageRepository,
					resolved,
				});

				return;
			}

			const provider = resolveModelProvider(modelId);

			await storeTranscription({
				contextUsed: JSON.stringify({
					hash: context.contextHash,
					lexiconIds: context.usedLexiconIds,
					pageIds: context.usedPageIds,
					tokens: context.tokenEstimate,
				}),
				costUsd: resolved.costUsd,
				documentId,
				fromCache: resolved.fromCache,
				inputTokens: resolved.inputTokens,
				latencyMs: resolved.latencyMs,
				modelId,
				outputTokens: resolved.outputTokens,
				pageId,
				presetId: preset.id,
				provider,
				structured: resolved.structured,
				text: resolved.text,
			});

			await applyBudgetStopIfExceeded(documentId);

			if (!resolved.fromCache) {
				try {
					await TranscriptionCacheModel.query().insert({
						cacheKey,
						costUsd: String(resolved.costUsd),
						hitCount: EMPTY_LENGTH,
						inputTokens: resolved.inputTokens,
						outputTokens: resolved.outputTokens,
						structured: resolved.structured ?? null,
						text: resolved.text,
					});
				} catch (error) {
					logger.warn(`Cache write skipped for page ${String(pageId)}`, {
						error,
					});
				}
			}

			logger.info(
				`Transcribed page ${String(pageNo)} of document ${String(documentId)}`,
				{
					costUsd: resolved.costUsd,
					fromCache: resolved.fromCache,
					spentMs: resolved.latencyMs,
				},
			);
		} catch (error) {
			logger.error(`page.transcribe failed for page ${String(pageId)}`, {
				error,
			});

			await releaseClaimedPage({
				documentId,
				documentRepository,
				enqueuePage,
				error,
				logger,
				pageId,
				pageRepository,
			});

			throw error;
		}
	};

const handleFailedTranscription = async ({
	documentId,
	documentRepository,
	enqueuePage,
	enqueueRetry,
	jobData,
	logger,
	pageAttempts,
	pageId,
	pageRepository,
	resolved,
}: Pick<
	Dependencies,
	| "documentRepository"
	| "enqueuePage"
	| "enqueueRetry"
	| "logger"
	| "pageRepository"
> & {
	documentId: number;
	jobData: PageTranscribeJobData;
	pageAttempts: number;
	pageId: number;
	resolved: FailedResolvedTranscription;
}): Promise<void> => {
	const nextAttempts = pageAttempts + ONE;

	const canRetry = resolved.retryable && nextAttempts < MAX_TRANSCRIBE_ATTEMPTS;

	const result = await DocumentModel.transaction(async (trx) => {
		const document = await DocumentModel.query(trx)
			.findById(documentId)
			.forUpdate();

		if (!document) {
			return { pagesToQueue: [], shouldRetry: false };
		}

		const claimedPage = await PageModel.query(trx)
			.findById(pageId)
			.where({
				attempts: pageAttempts,
				documentId,
				status: PageStatus.TRANSCRIBING,
			})
			.forUpdate();

		if (!claimedPage) {
			return { pagesToQueue: [], shouldRetry: false };
		}

		await trx.raw(
			`UPDATE ${DatabaseTableName.DOCUMENT} SET spent_usd = spent_usd + ? WHERE id = ?`,
			[resolved.costUsd, documentId],
		);

		await trx.from(DatabaseTableName.PAGE_EVENT).insert({
			actorId: null,
			details: {
				costUsd: resolved.costUsd,
				error: resolved.reason,
				inputTokens: resolved.inputTokens,
				outputTokens: resolved.outputTokens,
			},
			documentId,
			durationMs: resolved.latencyMs,
			event: PageEventName.TRANSCRIBE_FAILED,
			pageId,
			transcriptionId: null,
		});

		const budgetExhausted = await applyBudgetStopIfExceeded(documentId, trx);

		const retry = canRetry && !budgetExhausted;

		await trx
			.from(DatabaseTableName.PAGE)
			.where("id", pageId)
			.andWhere("status", PageStatus.TRANSCRIBING)
			.update({
				attempts: nextAttempts,
				lastError: budgetExhausted
					? TranscribeFailureReason.BUDGET_EXCEEDED
					: resolved.reason,
				status: retry ? PageStatus.QUEUED : PageStatus.FAILED,
			});

		const pagesToQueue = retry
			? []
			: await finalizePageFailure(
					{ documentId, documentRepository, pageRepository },
					trx,
				);

		return { pagesToQueue, shouldRetry: retry };
	});

	await enqueuePages(result.pagesToQueue, enqueuePage);

	if (!result.shouldRetry) {
		return;
	}

	try {
		await enqueueRetry(jobData);
	} catch (error) {
		await PageModel.query()
			.patch({
				status: PageStatus.FAILED,
			})
			.where({
				attempts: nextAttempts,
				id: pageId,
				status: PageStatus.QUEUED,
			})
			.execute();

		logger.error(`Failed to enqueue retry for page ${String(pageId)}`, {
			error,
		});
	}
};

const errorIsRetryable = (error: unknown): boolean => {
	if (!(error instanceof Error)) {
		return false;
	}

	if (RETRYABLE_ERROR_NAMES.includes(error.name)) {
		return true;
	}

	const errorWithStatus = error as {
		$metadata?: {
			httpStatusCode: number;
		};
		status?: number;
	};

	const status =
		errorWithStatus.status ?? errorWithStatus.$metadata?.httpStatusCode;

	return (
		status !== undefined &&
		status >= HTTPCode.INTERNAL_SERVER_ERROR &&
		status < MAX_RETRYABLE_HTTP_CODE
	);
};

export { createTranscribeHandler };
