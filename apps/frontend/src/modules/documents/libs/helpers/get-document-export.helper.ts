import { getDocumentExportFileName } from "@transcripta/shared";

import {
	type DocumentExport,
	type DocumentExportItemResponseDto,
} from "../types/types.js";
import { getExportMeta } from "./get-export-meta.helper.js";

const getDocumentExport = (
	documentExport: DocumentExportItemResponseDto,
	documentTitle: string,
): DocumentExport => ({
	downloadUrl: documentExport.downloadUrl,
	exportId: documentExport.id,
	id: String(documentExport.id),
	name: getDocumentExportFileName(documentTitle, documentExport.format),
	readyMeta: getExportMeta(documentExport),
	status: documentExport.status,
});

export { getDocumentExport };
