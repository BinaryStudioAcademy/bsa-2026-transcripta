type PDFPageProcessor = {
	convertPageToPNG(filePath: string, page: number): Promise<string>;
	getPageCount(filePath: string): Promise<number>;
	processPage(
		pngPath: string,
		blankStdevThreshold: null | number,
	): Promise<{
		isBlank: boolean;
		pageImage: Buffer;
		pageThumbnail: Buffer;
	}>;
};

export { type PDFPageProcessor };
