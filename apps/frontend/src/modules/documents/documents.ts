import { config } from "~/libs/modules/config/config.js";
import { http } from "~/libs/modules/http/http.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { DocumentApi } from "./documents-api.js";

const documentApi = new DocumentApi({
	baseUrl: config.ENV.API.ORIGIN_URL,
	http,
	storage,
});

export { documentApi };
export {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentExport,
	type DocumentGetAllItemResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdBudgetResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentGetPagesItemResponseDto,
	type DocumentGetPagesQueryDto,
	type DocumentGetPagesResponseDto,
	type DocumentUpdateBudgetDto,
	type DocumentUploadUrlRequestDto,
	type DocumentUploadUrlResponseDto,
	type ExportFormatValue,
} from "./libs/types/types.js";
export { DocumentCreateValidationSchema } from "./libs/validation-schemas/validation-schemas.js";
export { actions, reducer } from "./slices/documents.js";
