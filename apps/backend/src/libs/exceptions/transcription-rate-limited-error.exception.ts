type Constructor = {
	inputTokens: number;
	outputTokens: number;
	retryAfterMs: null | number;
};

class TranscriptionRateLimitedError extends Error {
	public inputTokens: number;

	public outputTokens: number;

	public retryAfterMs: null | number;

	public constructor({ inputTokens, outputTokens, retryAfterMs }: Constructor) {
		super("Transcription deferred: provider rate limit");
		this.name = "TranscriptionRateLimitedError";
		this.inputTokens = inputTokens;
		this.outputTokens = outputTokens;
		this.retryAfterMs = retryAfterMs;
	}
}

export { TranscriptionRateLimitedError };
