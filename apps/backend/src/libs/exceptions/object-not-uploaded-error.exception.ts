class ObjectNotUploadedError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "ObjectNotUploadedError";
	}
}

export { ObjectNotUploadedError };
