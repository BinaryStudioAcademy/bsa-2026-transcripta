import { config } from "~/libs/modules/config/config.js";
import { http } from "~/libs/modules/http/http.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { DocumentExportApi } from "./document-exports-api.js";

const documentExportApi = new DocumentExportApi({
	baseUrl: config.ENV.API.ORIGIN_URL,
	http,
	storage,
});

export { documentExportApi };
export { DocumentExportStatus } from "./libs/enums/enums.js";
export { type DocumentExportGetByIdResponseDto } from "./libs/types/types.js";
