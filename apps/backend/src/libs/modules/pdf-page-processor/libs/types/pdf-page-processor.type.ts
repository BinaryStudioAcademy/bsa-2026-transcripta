type PDFPageProcessor = {
	convertPageToPNG(filePath: string, page: number): Promise<string>;
	getFileSize(filePath: string): Promise<number>;
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
