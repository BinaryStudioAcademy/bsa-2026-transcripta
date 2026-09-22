import { type ValueOf } from "~/libs/types/types.js";

import { type ExportFormat } from "../enums/enums.js";

type DocumentExport = {
	id: string;
	name: string;
	ready: boolean;
	readyMeta: string;
};

type ExportFormatValue = ValueOf<typeof ExportFormat>;

export {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllItemResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentGetPagesItemResponseDto,
	type DocumentGetPagesQueryDto,
	type DocumentGetPagesResponseDto,
	type DocumentUploadUrlRequestDto,
	type DocumentUploadUrlResponseDto,
} from "@transcripta/shared";
export { type DocumentExport, type ExportFormatValue };
