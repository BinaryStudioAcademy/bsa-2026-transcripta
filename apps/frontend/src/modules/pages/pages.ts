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
	type UndoPageResponseDto,
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "./libs/types/types.js";
export { /** @public */ actions, reducer } from "./slices/pages.js";

export {
	selectCurrentPage,
	selectCursorPageNo,
	selectLastVerifiedPageId,
	selectPagesDataStatus,
	selectPagesForStrip,
	selectReprocessingPageId,
	selectVerificationDataStatus,
} from "./slices/selectors.js";
