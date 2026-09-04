const LoggerMessages = {
	CONNECTION_FAILED: (name: string): string =>
		`Failed to initialize queue ${name}.`,
	QUEUE_CLOSE_FAILED: (name: string): string =>
		`Failed to close queue ${name}.`,
	QUEUE_CLOSED: "Queue closed",
	QUEUE_READY: "Queue is ready",
	REDIS_CONNECTED: "Redis connected.",
	REDIS_CONNECTION_CLOSED: "Redis connection closed.",
	REDIS_CONNECTION_ERROR: "Redis connection error.",
	WORKER_CLOSE_FAILED: (name: string): string =>
		`Failed to close worker for queue ${name}.`,
} as const;

export { LoggerMessages };
