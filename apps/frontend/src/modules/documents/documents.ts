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
export { DocumentStatus } from "./libs/enums/enums.js";
export {
	type DocumentGetAllItemResponseDto,
	type DocumentGetAllResponseDto,
} from "./libs/types/types.js";
export { actions, reducer } from "./slices/documents.js";
