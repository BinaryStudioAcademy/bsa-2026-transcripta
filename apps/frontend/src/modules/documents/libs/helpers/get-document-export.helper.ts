import {
	type DocumentExport,
	type DocumentExportItemResponseDto,
} from "../types/types.js";
import { getExportFileName } from "./get-export-file-name.helper.js";
import { getExportMeta } from "./get-export-meta.helper.js";

const getDocumentExport = (
	documentExport: DocumentExportItemResponseDto,
	documentTitle: string,
): DocumentExport => ({
	downloadUrl: documentExport.downloadUrl,
	exportId: documentExport.id,
	id: String(documentExport.id),
	name: getExportFileName(documentTitle, documentExport.format),
	readyMeta: getExportMeta(documentExport),
	status: documentExport.status,
});

export { getDocumentExport };
