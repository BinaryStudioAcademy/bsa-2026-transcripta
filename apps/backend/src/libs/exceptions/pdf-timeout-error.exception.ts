class PDFTimeoutError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "PDFTimeoutError";
	}
}

export { PDFTimeoutError };
