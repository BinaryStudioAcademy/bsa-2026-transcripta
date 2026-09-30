import { type DocumentExportStatusValue } from "@transcripta/shared";

type DocumentExport = {
	downloadUrl: null | string;
	exportId: null | number;
	id: string;
	name: string;
	readyMeta: string;
	status: DocumentExportStatusValue;
};

export { type DocumentExport };
