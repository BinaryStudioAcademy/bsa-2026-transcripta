const withTimeout = async <T>(
	promise: Promise<T>,
	timeoutMs: number,
	timeoutErrorMessage = "Operation timed out.",
): Promise<T> => {
	let timer!: ReturnType<typeof setTimeout>;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			reject(new Error(timeoutErrorMessage));
		}, timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		clearTimeout(timer);
	}
};

export { withTimeout };
