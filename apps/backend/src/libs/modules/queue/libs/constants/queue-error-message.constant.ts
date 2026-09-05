const QueueErrorMessage = {
	FAILED_TO_CLOSE_REGISTRY: "Failed to close queue registry.",
	QUEUE_NOT_CREATED: "Queue hasn't created!",
	REDIS_UNAVAILABLE:
		"Redis is unavailable. Check REDIS_URL and make sure Redis is running.",
} as const;

export { QueueErrorMessage };
