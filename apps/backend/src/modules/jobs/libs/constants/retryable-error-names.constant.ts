const RETRYABLE_ERROR_NAMES: readonly string[] = [
	"APIConnectionTimeoutError",
	"TimeoutError",
] as const;

export { RETRYABLE_ERROR_NAMES };
