type PDFPageProcessor = {
	getPageCount(filePath: string): Promise<number>;
	processPage(
		filePath: string,
		page: number,
		blankStdevThreshold: null | number,
	): Promise<{
		isBlank: boolean;
		pageImage: Buffer;
		pageThumbnail: Buffer;
	}>;
};

export { type PDFPageProcessor };
