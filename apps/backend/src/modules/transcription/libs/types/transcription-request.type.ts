type TranscriptionRequest = {
	image?: Buffer | undefined;
	mediaType?: string | undefined;
	modelId?: string | undefined;
	prompt: string;
};

export { type TranscriptionRequest };
