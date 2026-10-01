type ProcessQueuePayload = {
	completedDocumentId: null | number;
	failed?: {
		item: {
			pageNo: number;
			payload: {
				action: string;
				text?: string;
			};
		};
	};
};

export { type ProcessQueuePayload };
