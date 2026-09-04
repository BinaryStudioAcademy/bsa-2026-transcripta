import { DocumentStatus, PageStatus, type ValueOf } from "@transcripta/shared";
import { type Job } from "bullmq";

import { buildContext } from "~/context/builder.js";
import { type BuiltContext } from "~/context/libs/types/types.js";
import { buildUserPrompt } from "~/context/prompt.js";
import { type Config } from "~/libs/modules/config/config.js";
import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type QueueJobPayload } from "~/libs/modules/queue/queue.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { DocumentModel } from "~/modules/documents/document.model.js";
import { PageModel } from "~/modules/pages/page.model.js";
import { PresetModel } from "~/modules/presets/preset.model.js";
import { type TranscriptionResponse } from "~/modules/transcription/libs/types/types.js";
import { TranscriptionCacheModel } from "~/modules/transcription/transcription-cache.model.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";
import { createOutputValidator } from "~/transcription/libs/helpers/output-validator.helper.js";
import { calculateTokenCost } from "~/transcription/libs/helpers/pricing.helper.js";

import { buildCacheKey } from "./libs/helpers/cache-key.helper.js";

const DEFAULT_PROVIDER = "unknown";
const MAX_REPAIR_ATTEMPTS = 1;
const ONE = 1;
const PAGE_MEDIA_TYPE = "image/webp";
const PROVIDER_INDEX = 1;
const TRANSCRIBABLE_STATUSES = new Set<ValueOf<typeof DocumentStatus>>([
	DocumentStatus.PROCESSING,
	DocumentStatus.READY,
]);
const ZERO = 0;

type CallOutcome = {
	inputTokens: number;
	latencyMs: number;
	outputTokens: number;
	structured: unknown;
	text: string;
};

type Dependencies = {
	config: Config;
	logger: Logger;
	storage: BaseStorage;
	transcriptionService: TranscriptionService;
};

type ParseResult = { ok: false } | { ok: true; value: unknown };

type ResolvedTranscription = {
	costUsd: number;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	outputTokens: number;
	structured: unknown;
	text: string;
};

type ResolveOptions = Dependencies & {
	cacheKey: string;
	context: BuiltContext;
	documentId: number;
	modelId: string;
	page: InstanceType<typeof PageModel>;
	pageNo: number;
	preset: InstanceType<typeof PresetModel>;
};

type StoreOptions = {
	contextUsed: string;
	costUsd: number;
	documentId: number;
	fromCache: boolean;
	inputTokens: number;
	latencyMs: number;
	modelId: string;
	outputTokens: number;
	pageId: number;
	presetId: number;
	provider: string;
	structured: unknown;
	text: string;
};

type TranscribeRequestOptions = {
	image: Buffer;
	logger: Logger;
	mediaType: string;
	modelId: string;
	outputSchema: null | Record<string, unknown>;
	pageId: number;
	prompt: string;
	transcriptionService: TranscriptionService;
};

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
	errorMessage: string,
	attempts: number,
): Promise<void> => {
	await PageModel.query()
		.patch({
			attempts: attempts + ONE,
			lastError: errorMessage,
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
): Promise<CallOutcome | null> => {
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

	for (let attempt = ZERO; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
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
			return null;
		}

		const parsed = parseModelJson(response.text);

		if (!parsed.ok) {
			if (attempt >= MAX_REPAIR_ATTEMPTS) {
				return null;
			}

			repairNote = "Your previous output was not valid JSON.";
			continue;
		}

		const result = createOutputValidator(outputSchema ?? {})(parsed.value);

		if (result.valid) {
			return {
				inputTokens: response.usage.inputTokens,
				latencyMs: response.latencyMs,
				outputTokens: response.usage.outputTokens,
				structured: parsed.value,
				text: response.text,
			};
		}

		if (attempt >= MAX_REPAIR_ATTEMPTS) {
			return null;
		}

		repairNote = formatValidationErrors(result.errors ?? []);
	}

	return null;
};

const resolveFromCacheOrModel = async (
	options: ResolveOptions,
): Promise<null | ResolvedTranscription> => {
	const { cacheKey, context, page, preset } = options;

	const cached = await TranscriptionCacheModel.query()
		.findById(cacheKey)
		.execute();

	if (cached) {
		let structured: unknown = null;

		try {
			structured = cached.structured ? JSON.parse(cached.structured) : null;
		} catch {
			structured = null;
		}

		await TranscriptionCacheModel.query()
			.patch({
				hitCount: cached.hitCount + ONE,
				lastHitAt: new Date().toISOString(),
			})
			.where("cache_key", cacheKey)
			.execute();

		return {
			costUsd: Number(cached.costUsd),
			fromCache: true,
			inputTokens: cached.inputTokens,
			latencyMs: ZERO,
			outputTokens: cached.outputTokens,
			structured,
			text: cached.text,
		};
	}

	if (!page.imageKey) {
		await recordFailure(page.id, "page_image_missing", page.attempts);
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

	if (!outcome) {
		await recordFailure(page.id, "invalid_model_output", page.attempts);
		return null;
	}

	return {
		costUsd: calculateTokenCost(
			modelId,
			outcome.inputTokens,
			outcome.outputTokens,
		),
		fromCache: false,
		inputTokens: outcome.inputTokens,
		latencyMs: outcome.latencyMs,
		outputTokens: outcome.outputTokens,
		structured: outcome.structured,
		text: outcome.text,
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
			structured: structured ? JSON.stringify(structured) : null,
			text,
		});

		// The database adds the cost itself — never read+modify+write.
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
	const document = await DocumentModel.query().findById(documentId);

	if (document && isBudgetExhausted(document)) {
		await markDocumentStopped(documentId);
	}
};

const createTranscribeHandler =
	({ config, logger, storage, transcriptionService }: Dependencies) =>
	async (job: Job<QueueJobPayload>): Promise<void> => {
		const { documentId, pageId, pageNo, presetId } = job.data;

		const document = await DocumentModel.query().findById(documentId);
		const page = await PageModel.query().findById(pageId);

		// Step 1: cheap guard — never spend on a page whose document is not
		// transcribing (paused, cancelled/deleted, done, failed...).
		if (!document || !page || !TRANSCRIBABLE_STATUSES.has(document.status)) {
			logger.info(
				`Skip page.transcribe ${String(pageId)}: document not transcribing`,
				{ documentStatus: document?.status },
			);
			return;
		}

		// Step 2: budget before the call — refuse a call we cannot afford.
		if (isBudgetExhausted(document)) {
			logger.warn(`Budget exhausted for document ${String(documentId)}`);

			await PageModel.query()
				.patch({
					attempts: page.attempts + ONE,
					lastError: "budget_exceeded",
					status: PageStatus.FAILED,
				})
				.where("id", pageId)
				.execute();

			await markDocumentStopped(documentId);
			return;
		}

		const preset = await PresetModel.query().findById(presetId);

		if (!preset) {
			await recordFailure(pageId, "preset_not_found", page.attempts);
			return;
		}

		// Step 3: build the context and cache key. The exact model id is part
		// of the key so a bare id or alias never serves a wrong cached answer.
		const modelId = config.ENV.BEDROCK.MODEL_ID;
		const knex = AbstractModel.knex();
		const context = await buildContext({ documentId, knex, pageNo, preset });

		const cacheKey = buildCacheKey({
			contextHash: context.contextHash,
			imageSha256: page.imageSha256 ?? "",
			modelId,
			presetId: preset.id,
		});

		// Step 4-6: cache hit (free) or model call with one repair.
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

		// Step 7: one transaction — result, cost and status together.
		const provider = modelId.split(".")[PROVIDER_INDEX] ?? DEFAULT_PROVIDER;

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
			presetId,
			provider,
			structured: resolved.structured,
			text: resolved.text,
		});

		// Step 8: re-check the budget after this very charge.
		await applyBudgetStopIfExceeded(documentId);

		// Write the model result into the cache so a re-run is free.
		if (!resolved.fromCache) {
			try {
				await TranscriptionCacheModel.query().insert({
					cacheKey,
					costUsd: String(resolved.costUsd),
					hitCount: ZERO,
					inputTokens: resolved.inputTokens,
					outputTokens: resolved.outputTokens,
					structured: resolved.structured
						? JSON.stringify(resolved.structured)
						: null,
					text: resolved.text,
				});
			} catch (error) {
				// The cache is an optimization — a concurrent duplicate insert
				// must never fail an already-stored transcription.
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
	};

export { createTranscribeHandler };
