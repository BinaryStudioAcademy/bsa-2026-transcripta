import { DocumentExportFormat } from "../enums/enums.js";
import {
	serializeToCsv,
	serializeToJson,
	serializeToTxt,
} from "../helpers/helpers.js";
import {
	type DocumentExportFormatValue,
	type PageItem,
} from "../types/types.js";

const Serializers: Record<
	DocumentExportFormatValue,
	(pages: PageItem[]) => string
> = {
	[DocumentExportFormat.CSV]: serializeToCsv,
	[DocumentExportFormat.JSON]: serializeToJson,
	[DocumentExportFormat.TXT]: serializeToTxt,
};

export { Serializers };
