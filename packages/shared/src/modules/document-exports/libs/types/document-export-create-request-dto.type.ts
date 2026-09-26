import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentExportFormat } from "../enums/enums.js";

type DocumentExportCreateRequestDto = {
	format: ValueOf<typeof DocumentExportFormat>;
};

export { type DocumentExportCreateRequestDto };
