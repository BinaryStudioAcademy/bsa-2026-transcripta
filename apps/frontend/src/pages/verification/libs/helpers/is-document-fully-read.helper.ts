import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { type DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";

const isDocumentFullyRead = (
	document: DocumentGetByIdResponseDto | null,
): boolean =>
	Boolean(
		document &&
			document.progress.pagesTotal >= document.pageCount &&
			document.progress.pagesPending === INITIAL_COUNT &&
			document.progress.pagesInWork === INITIAL_COUNT,
	);

export { isDocumentFullyRead };
