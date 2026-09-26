import { type ValueOf } from "src/libs/types/value-of.type.js";

import { DocumentExportFormat } from "../enums/enums.js";

type DocumentExportCreateRequestDto = {
	format: ValueOf<typeof DocumentExportFormat>;
};

export { type DocumentExportCreateRequestDto };
