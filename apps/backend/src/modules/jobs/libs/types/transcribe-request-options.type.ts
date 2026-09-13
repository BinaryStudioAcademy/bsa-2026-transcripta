import { type Logger } from "~/libs/modules/logger/logger.js";
import { type TranscriptionService } from "~/modules/transcription/transcription.service.js";

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

export { type TranscribeRequestOptions };
