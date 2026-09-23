import {
	DocumentStatus,
	EMPTY_LENGTH,
	HTTPCode,
	PageStatus,
} from "@transcripta/shared";
import { DelayedError, type Job } from "bullmq";
import { type Transaction } from "objection";

import {
	ProviderRateLimitError,
	TranscriptionRateLimitedError,
} from "~/libs/exceptions/exceptions.js";
import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";
import { Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";
import { buildContext, buildUserPrompt } from "~/modules/context/context.js";
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
	RATE_LIMIT_RETRY_DELAY_MS,
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
	type HandleFailedTranscriptionPayload,
	type ModelIdValue,
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

const throwIfRateLimited = (
	error: unknown,
	usage: { inputTokens: number; outputTokens: number },
): void => {
	if (error instanceof ProviderRateLimitError) {
		throw new TranscriptionRateLimitedError({
			inputTokens: usage.inputTokens,
			outputTokens: usage.outputTokens,
			retryAfterMs: error.retryAfterMs,
		});
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
	let lastPromptUsed = prompt;
	let lastRawResponse = "";
	let usedInputTokens = EMPTY_LENGTH;
	let usedLatencyMs = EMPTY_LENGTH;
	let usedOutputTokens = EMPTY_LENGTH;

	const createFailureOutcome = ({
		prompt: promptUsed,
		rawResponse,
		reason,
		retryable = false,
	}: {
		prompt: string;
		rawResponse: string;
		reason: TranscribeFailureReasonValue;
		retryable?: boolean;
	}): CallOutcome => ({
		inputTokens: usedInputTokens,
		latencyMs: usedLatencyMs,
		ok: false,
		outputTokens: usedOutputTokens,
		prompt: promptUsed,
		rawResponse,
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
			throwIfRateLimited(error, {
				inputTokens: usedInputTokens,
				outputTokens: usedOutputTokens,
			});

			logger.error(`Model call failed for page ${String(pageId)}`, { error });

			return createFailureOutcome({
				prompt: lastPromptUsed,
				rawResponse: lastRawResponse,
				reason: TranscribeFailureReason.MODEL_CALL_FAILED,
				retryable: isErrorRetryable(error),
			});
		}

		usedInputTokens += response.usage.inputTokens;
		usedLatencyMs += response.latencyMs;
		usedOutputTokens += response.usage.outputTokens;

		const rawResponse = response.text;
		lastPromptUsed = requestPrompt;
		lastRawResponse = rawResponse;
		const responseText = stripCodeFence(rawResponse);
		const parsed = parseModelJson(responseText);

		if (!parsed.ok) {
			if (attempt >= MAX_REPAIR_ATTEMPTS) {
				return createFailureOutcome({
					prompt: requestPrompt,
					rawResponse,
					reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
				});
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
				prompt: requestPrompt,
				rawResponse,
				structured: parsed.value,
				text: responseText,
			};
		}

		if (attempt >= MAX_REPAIR_ATTEMPTS) {
			return createFailureOutcome({
				prompt: requestPrompt,
				rawResponse,
				reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
			});
		}

		repairNote = formatValidationErrors(result.errors ?? []);
	}

	return createFailureOutcome({
		prompt: lastPromptUsed,
		rawResponse: lastRawResponse,
		reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
	});
};

const resolveFromCacheOrModel = async (
	options: ResolveOptions,
): Promise<null | ResolvedTranscription> => {
	const { cacheKey, context, page, preset } = options;
	const userPrompt = buildUserPrompt(preset, context.blocks);

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
			prompt: userPrompt,
			rawResponse: "",
			structured,
			text: cached.text,
		};
	}

	if (!page.imageKey) {
		return null;
	}

	const { logger, modelId, storage, transcriptionService } = options;

	const image = await storage.downloadPageImage(page.imageKey);

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
			prompt: outcome.prompt,
			rawResponse: outcome.rawResponse,
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
		prompt: outcome.prompt,
		rawResponse: outcome.rawResponse,
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
		prompt,
		provider,
		rawResponse,
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
			prompt,
			provider,
			raw_response: rawResponse,
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

const deferRateLimitedPage = async ({
	documentId,
	error,
	job,
	logger,
	modelId,
	pageId,
	pauseWorkerFor,
	token,
}: {
	documentId: number;
	error: TranscriptionRateLimitedError;
	job: Job<PageTranscribeJobData>;
	logger: Logger;
	modelId: ModelIdValue;
	pageId: number;
	pauseWorkerFor: (delayMs: number) => Promise<void>;
	token: string | undefined;
}): Promise<void> => {
	const { retryAfterMs } = error;
	const delayMs = retryAfterMs ?? RATE_LIMIT_RETRY_DELAY_MS;
	const costUsd = calculateTokenCost({
		inputTokens: error.inputTokens,
		modelId,
		outputTokens: error.outputTokens,
	});

	await DocumentModel.transaction(async (trx) => {
		await trx.raw(
			`UPDATE ${DatabaseTableName.DOCUMENT} SET spent_usd = spent_usd + ? WHERE id = ?`,
			[costUsd, documentId],
		);

		await trx
			.from(DatabaseTableName.PAGE)
			.where({ id: pageId, status: PageStatus.TRANSCRIBING })
			.update({ status: PageStatus.QUEUED });

		await trx.from(DatabaseTableName.PAGE_EVENT).insert({
			actorId: null,
			details: { costUsd, retryAfterMs },
			documentId,
			durationMs: EMPTY_LENGTH,
			event: PageEventName.TRANSCRIBE_RATE_LIMITED,
			pageId,
			transcriptionId: null,
		});
	});

	await applyBudgetStopIfExceeded(documentId);

	logger.warn(
		`Rate limited on page ${String(pageId)}, retrying in ${String(delayMs)} ms`,
	);

	await pauseWorkerFor(delayMs);

	await job.moveToDelayed(Date.now() + delayMs, token);
};

const resolveOrDefer = async ({
	job,
	pauseWorkerFor,
	token,
	...options
}: ResolveOptions & {
	job: Job<PageTranscribeJobData>;
	pauseWorkerFor: (delayMs: number) => Promise<void>;
	token: string | undefined;
}): Promise<null | ResolvedTranscription> => {
	try {
		return await resolveFromCacheOrModel(options);
	} catch (error) {
		if (!(error instanceof TranscriptionRateLimitedError)) {
			throw error;
		}

		await deferRateLimitedPage({
			documentId: options.documentId,
			error,
			job,
			logger: options.logger,
			modelId: options.modelId,
			pageId: options.page.id,
			pauseWorkerFor,
			token,
		});

		throw new DelayedError();
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
		pauseWorkerFor,
		storage,
		transcriptionService,
	}: Dependencies) =>
	async (job: Job<PageTranscribeJobData>, token?: string): Promise<void> => {
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

		if (page.documentId !== documentId) {
			logger.warn(
				`Skip page.transcribe ${String(pageId)}: page belongs to document ${String(page.documentId)}, not ${String(documentId)}`,
			);

			return;
		}

		const claimedRows = await PageModel.query()
			.patch({ status: PageStatus.TRANSCRIBING })
			.where({
				documentId,
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

			const modelId = (preset.settings.model ||
				config.ENV.BEDROCK.MODEL_ID) as ModelIdValue;
			const context = await buildContext({
				documentId,
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

			const resolved = await resolveOrDefer({
				cacheKey,
				config,
				context,
				documentId,
				documentRepository,
				job,
				logger,
				modelId,
				page,
				pageNo,
				pauseWorkerFor,
				preset,
				storage,
				token,
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
					contextUsed: JSON.stringify({
						hash: context.contextHash,
						lexiconIds: context.usedLexiconIds,
						pageIds: context.usedPageIds,
						tokens: context.tokenEstimate,
					}),
					documentId,
					documentRepository,
					enqueuePage,
					enqueueRetry,
					jobData: job.data,
					logger,
					modelId,
					pageAttempts: page.attempts,
					pageId,
					pageRepository,
					presetId: preset.id,
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
				prompt: resolved.prompt,
				provider,
				rawResponse: resolved.rawResponse,
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
			if (error instanceof DelayedError) {
				throw error;
			}

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
	contextUsed,
	documentId,
	documentRepository,
	enqueuePage,
	enqueueRetry,
	jobData,
	logger,
	modelId,
	pageAttempts,
	pageId,
	pageRepository,
	presetId,
	resolved,
}: HandleFailedTranscriptionPayload &
	Pick<Dependencies, "enqueuePage" | "pageRepository">): Promise<void> => {
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

		const budgetExhausted = await applyBudgetStopIfExceeded(documentId, trx);

		const retry = canRetry && !budgetExhausted;

		let transcriptionId: null | number = null;

		if (!retry) {
			const provider = resolveModelProvider(modelId);

			await trx
				.from(DatabaseTableName.TRANSCRIPTION)
				.where("page_id", pageId)
				.where("is_current", true)
				.update({ is_current: false });

			const insertedRows: Array<{ id: number }> = await trx
				.from(DatabaseTableName.TRANSCRIPTION)
				.insert({
					context_used: contextUsed,
					cost_usd: resolved.costUsd,
					document_id: documentId,
					from_cache: resolved.fromCache,
					input_tokens: resolved.inputTokens,
					latency_ms: resolved.latencyMs,
					model: modelId,
					output_tokens: resolved.outputTokens,
					page_id: pageId,
					preset_id: presetId,
					prompt: resolved.prompt,
					provider,
					raw_response: resolved.rawResponse,
					structured: null,
					text: "",
				})
				.returning("id");

			transcriptionId = insertedRows[EMPTY_LENGTH]?.id ?? null;
		}

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
			transcriptionId,
		});

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

		const pagesToQueue =
			retry || budgetExhausted
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
		const pages = await DocumentModel.transaction(async (trx) => {
			const document = await DocumentModel.query(trx)
				.findById(documentId)
				.forUpdate();

			if (!document) {
				return [];
			}

			const failedRows = await PageModel.query(trx)
				.patch({ status: PageStatus.FAILED })
				.where({
					attempts: nextAttempts,
					documentId,
					id: pageId,
					status: PageStatus.QUEUED,
				})
				.execute();

			if (failedRows === EMPTY_LENGTH) {
				return [];
			}

			return await finalizePageFailure(
				{ documentId, documentRepository, pageRepository },
				trx,
			);
		});

		logger.error(`Failed to enqueue retry for page ${String(pageId)}`, {
			error,
		});

		await enqueuePages(pages, enqueuePage);
	}
};

const isErrorRetryable = (error: unknown): boolean => {
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
