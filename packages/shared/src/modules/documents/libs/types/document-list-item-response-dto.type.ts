import { type DocumentStatusValue } from "./document-status-value.type.js";

type DocumentListItemResponseDto = {
	createdAt: string;
	id: number;
	pageCount: number;
	status: DocumentStatusValue;
	title: string;
};

export { type DocumentListItemResponseDto };
