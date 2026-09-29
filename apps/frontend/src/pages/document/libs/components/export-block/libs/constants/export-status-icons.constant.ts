import { type DocumentExportStatusValue } from "@transcripta/shared";

import { DocumentExportStatus } from "~/modules/documents/libs/enums/enums.js";

const EXPORT_STATUS_ICONS: Record<DocumentExportStatusValue, string> = {
	[DocumentExportStatus.FAILED]: "!",
	[DocumentExportStatus.QUEUED]: "░",
	[DocumentExportStatus.READY]: "✓",
};

export { EXPORT_STATUS_ICONS };
