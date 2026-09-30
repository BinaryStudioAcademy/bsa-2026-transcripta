type EnqueuePageTranscribe = (payload: {
	documentId: number;
	pageId: number;
	pageNo: number;
}) => Promise<void>;

export { EnqueuePageTranscribe };
