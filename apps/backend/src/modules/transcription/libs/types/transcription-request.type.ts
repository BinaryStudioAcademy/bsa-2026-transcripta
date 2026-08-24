type TranscriptionRequest = {
	image: Buffer;
	mediaType: string;
	modelId?: string | undefined;
	prompt: string;
};

export { type TranscriptionRequest };
