import { type DocumentModel } from "~/modules/documents/document.model.js";

type DocumentWithPagesFailed = DocumentModel & {
	pagesFailed: number;
};

export { DocumentWithPagesFailed };
