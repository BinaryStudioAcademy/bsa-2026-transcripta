import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { HTTPCode, HTTPMethod } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";

import { type TranscriptionService } from "./transcription.service.js";

type TranscribeBody = {
	image: Buffer;
	mediaType?: string;
	modelId?: string;
	prompt?: string;
};

const DEFAULT_MEDIA_TYPE = "image/png";
const DEFAULT_PROMPT = "Transcribe the handwritten text on this page.";

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

	private async transcribe(
		options: APIHandlerOptions<{
			body: TranscribeBody;
		}>,
	): Promise<APIHandlerResponse> {
		const { image, mediaType, modelId, prompt } = options.body;

		return {
			payload: await this.transcriptionService.transcribe({
				image,
				mediaType: mediaType ?? DEFAULT_MEDIA_TYPE,
				modelId,
				prompt: prompt ?? DEFAULT_PROMPT,
			}),
			status: HTTPCode.OK,
		};
	}
}

export { TranscriptionController };
