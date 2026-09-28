const logger = {
	error(message: string, error: unknown): void {
		globalThis.console.error(message, error);
	},
} as const;

export { logger };
