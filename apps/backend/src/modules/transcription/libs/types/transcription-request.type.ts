type TranscriptionRequest = {
	image: Buffer;
	mediaType: string;
	modelId?: string;
	prompt: string;
};

export { type TranscriptionRequest };
