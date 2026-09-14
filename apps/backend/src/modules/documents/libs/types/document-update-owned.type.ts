import { type DocumentStatusValue } from "./document-status-value.type.js";

type DocumentUpdateOwnedStatus = {
	currentStatus: DocumentStatusValue;
	id: number;
	ownerId: number;
	status: DocumentStatusValue;
};

export { DocumentUpdateOwnedStatus };
