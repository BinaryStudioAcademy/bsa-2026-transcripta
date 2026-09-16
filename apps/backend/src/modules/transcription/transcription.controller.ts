import { EMPTY_LENGTH, ModelId, type ModelIdValue } from "@transcripta/shared";

import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { HTTPCode, HTTPMethod } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";

import {
	calculateTokenCost,
	resolveModelProvider,
} from "./libs/helpers/helpers.js";
import { type TranscriptionService } from "./transcription.service.js";

type TranscribeBody = {
	image: Buffer;
	mediaType?: string;
	modelId?: string;
	prompt?: string;
};

const DEFAULT_MEDIA_TYPE = "image/png";
const DEFAULT_PROMPT = "Transcribe the handwritten text on this page.";
const KNOWN_MODEL_IDS = new Set<string>(Object.values(ModelId));

/**
 * A calibration sandbox, not a product route: no auth, nothing persisted.
 * It exists to measure how well a model reads our handwriting.
 */
class TranscriptionController extends BaseController {
	private transcriptionService: TranscriptionService;

	public constructor(
		logger: Logger,
		transcriptionService: TranscriptionService,
	) {
		super(logger, "/test");

		this.transcriptionService = transcriptionService;

		this.addRoute({
			handler: (options) =>
				this.transcribe(
					options as APIHandlerOptions<{
						body: TranscribeBody;
					}>,
				),
			method: HTTPMethod.POST,
			path: "/transcribe",
		});
	}

	/**
	 * @swagger
	 * /test/transcribe:
	 *   post:
	 *     description: Sandbox transcription with debug fields (nothing persisted)
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - image
	 *             properties:
	 *               image:
	 *                 type: string
	 *                 format: binary
	 *               mediaType:
	 *                 type: string
	 *               modelId:
	 *                 type: string
	 *               prompt:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Model output plus prompt, cost, provider and tokens
	 */
	private async transcribe(
		options: APIHandlerOptions<{
			body: TranscribeBody;
		}>,
	): Promise<APIHandlerResponse> {
		const { image, mediaType, modelId, prompt } = options.body;
		const resolvedPrompt = prompt ?? DEFAULT_PROMPT;

		const response = await this.transcriptionService.transcribe({
			image,
			mediaType: mediaType ?? DEFAULT_MEDIA_TYPE,
			modelId,
			prompt: resolvedPrompt,
		});

		const knownModelId = KNOWN_MODEL_IDS.has(response.modelId)
			? (response.modelId as ModelIdValue)
			: null;

		const costUsd =
			knownModelId === null
				? EMPTY_LENGTH
				: calculateTokenCost({
						inputTokens: response.usage.inputTokens,
						modelId: knownModelId,
						outputTokens: response.usage.outputTokens,
					});

		return {
			payload: {
				costUsd: String(costUsd),
				latencyMs: response.latencyMs,
				modelId: response.modelId,
				prompt: resolvedPrompt,
				provider: resolveModelProvider(response.modelId),
				rawResponse: response.text,
				text: response.text,
				usage: response.usage,
			},
			status: HTTPCode.OK,
		};
	}
}

export { TranscriptionController };
