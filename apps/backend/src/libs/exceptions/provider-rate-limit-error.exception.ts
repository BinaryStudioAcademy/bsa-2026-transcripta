class ProviderRateLimitError extends Error {
	public retryAfterMs: null | number;

	public constructor(retryAfterMs: null | number) {
		super("Provider rate limit exceeded");
		this.name = "ProviderRateLimitError";
		this.retryAfterMs = retryAfterMs;
	}
}

export { ProviderRateLimitError };
