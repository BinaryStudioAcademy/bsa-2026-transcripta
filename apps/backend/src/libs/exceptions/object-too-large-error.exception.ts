class ObjectTooLargeError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "ObjectTooLargeError";
	}
}

export { ObjectTooLargeError };
