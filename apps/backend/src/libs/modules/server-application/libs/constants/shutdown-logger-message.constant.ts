const ShutdownLoggerMessages = {
	CLOSED: "Shutdown complete.",
	FAILED: (name: string): string => `Failed to close ${name}.`,
} as const;

export { ShutdownLoggerMessages };
