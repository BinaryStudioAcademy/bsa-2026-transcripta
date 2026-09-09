import { config } from "~/libs/modules/config/config.js";
import { http } from "~/libs/modules/http/http.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { PageApi } from "./pages-api.js";

const pageApi = new PageApi({
	baseUrl: config.ENV.API.ORIGIN_URL,
	http,
	storage,
});

export { pageApi };
export {
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "./libs/types/types.js";
export { /** @public */ actions, reducer } from "./slices/pages.js";

export {
	selectCurrentPage,
	selectPagesDataStatus,
} from "./slices/selectors.js";
