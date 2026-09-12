import { DocumentStatus, EMPTY_LENGTH, PageStatus } from "@transcripta/shared";
import { type Job } from "bullmq";

import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";
import { buildContext } from "~/modules/context/builder.js";
import { buildUserPrompt } from "~/modules/context/prompt.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
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
	ONE,
	PAGE_MEDIA_TYPE,
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
	type ParseResult,
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

const recordFailure = async (
	pageId: number,
	reason: TranscribeFailureReasonValue,
): Promise<void> => {
	await PageModel.query()
		.patch({
			attempts: AbstractModel.knex().raw("attempts + ?", [ONE]),
			lastError: reason,
			status: PageStatus.FAILED,
		})
		.where("id", pageId)
		.execute();
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

			return {
				inputTokens: usedInputTokens,
				latencyMs: usedLatencyMs,
				ok: false,
				outputTokens: usedOutputTokens,
				reason: TranscribeFailureReason.MODEL_CALL_FAILED,
			};
		}

		usedInputTokens += response.usage.inputTokens;
		usedLatencyMs += response.latencyMs;
		usedOutputTokens += response.usage.outputTokens;

		const responseText = stripCodeFence(response.text);
		const parsed = parseModelJson(responseText);

		if (!parsed.ok) {
			if (attempt >= MAX_REPAIR_ATTEMPTS) {
				return {
					inputTokens: usedInputTokens,
					latencyMs: usedLatencyMs,
					ok: false,
					outputTokens: usedOutputTokens,
					reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
				};
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
			return {
				inputTokens: usedInputTokens,
				latencyMs: usedLatencyMs,
				ok: false,
				outputTokens: usedOutputTokens,
				reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
			};
		}

		repairNote = formatValidationErrors(result.errors ?? []);
	}

	return {
		inputTokens: usedInputTokens,
		latencyMs: usedLatencyMs,
		ok: false,
		outputTokens: usedOutputTokens,
		reason: TranscribeFailureReason.INVALID_MODEL_OUTPUT,
	};
};

const resolveFromCacheOrModel = async (
	options: ResolveOptions,
): Promise<null | ResolvedTranscription> => {
	const { cacheKey, config, context, page, preset } = options;

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
		await recordFailure(page.id, TranscribeFailureReason.PAGE_IMAGE_MISSING);
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
		rates: {
			amazon: {
				input: config.ENV.PRICING.AMAZON_INPUT,
				output: config.ENV.PRICING.AMAZON_OUTPUT,
			},
			anthropic: {
				input: config.ENV.PRICING.ANTHROPIC_INPUT,
				output: config.ENV.PRICING.ANTHROPIC_OUTPUT,
			},
			anthropicDirect: {
				input: config.ENV.PRICING.ANTHROPIC_DIRECT_INPUT,
				output: config.ENV.PRICING.ANTHROPIC_DIRECT_OUTPUT,
			},
		},
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

		await trx
			.from(DatabaseTableName.PAGE)
			.where("id", pageId)
			.update({ status: PageStatus.TRANSCRIBED });
	});
};

const applyBudgetStopIfExceeded = async (documentId: number): Promise<void> => {
	await DocumentModel.query()
		.patch({ status: DocumentStatus.BUDGET_STOP })
		.where("id", documentId)
		.whereNot("status", DocumentStatus.BUDGET_STOP)
		.whereRaw("spent_usd >= budget_usd")
		.execute();
};

const releaseClaimedPage = async ({
	documentId,
	error,
	logger,
	pageId,
}: {
	documentId: number;
	error: unknown;
	logger: Logger;
	pageId: number;
}): Promise<void> => {
	try {
		await DocumentModel.transaction(async (trx) => {
			const releasedRows = await trx
				.from(DatabaseTableName.PAGE)
				.where({ id: pageId, status: PageStatus.TRANSCRIBING })
				.update({
					attempts: AbstractModel.knex().raw("attempts + ?", [ONE]),
					lastError: TranscribeFailureReason.UNEXPECTED_ERROR,
					status: PageStatus.FAILED,
				});

			if (releasedRows === EMPTY_LENGTH) {
				return;
			}

			await trx.from(DatabaseTableName.PAGE_EVENT).insert({
				actorId: null,
				details: {
					error: TranscribeFailureReason.UNEXPECTED_ERROR,
					message: error instanceof Error ? error.message : String(error),
				},
				documentId,
				durationMs: EMPTY_LENGTH,
				event: PageEventName.TRANSCRIBE_FAILED,
				pageId,
				transcriptionId: null,
			});
		});
	} catch (releaseError) {
		logger.error(`Failed to release claimed page ${String(pageId)}`, {
			error: releaseError,
		});
	}
};

const createTranscribeHandler =
	({ config, logger, storage, transcriptionService }: Dependencies) =>
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
						lastError: TranscribeFailureReason.BUDGET_EXCEEDED,
						status: PageStatus.FAILED,
					});
				});

				await markDocumentStopped(documentId);
				return;
			}

			const preset = await PresetModel.query().findById(document.presetId);

			if (!preset) {
				await recordFailure(pageId, TranscribeFailureReason.PRESET_NOT_FOUND);
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
				await recordFailure(
					pageId,
					TranscribeFailureReason.PAGE_IMAGE_SHA_MISSING,
				);
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
				return;
			}

			if (!resolved.ok) {
				await DocumentModel.transaction(async (trx) => {
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

					await trx
						.from(DatabaseTableName.PAGE)
						.where("id", pageId)
						.update({
							attempts: AbstractModel.knex().raw("attempts + ?", [ONE]),
							lastError: resolved.reason,
							status: PageStatus.FAILED,
						});
				});

				await applyBudgetStopIfExceeded(documentId);
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

			await releaseClaimedPage({ documentId, error, logger, pageId });

			throw error;
		}
	};

export { createTranscribeHandler };
