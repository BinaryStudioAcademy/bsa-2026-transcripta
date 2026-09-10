class PDFTimeoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PDFTimeoutError";
	}
}

export { PDFTimeoutError };
