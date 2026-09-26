import { config } from "~/libs/modules/config/config.js";
import { http } from "~/libs/modules/http/http.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { LexiconApi } from "./lexicon-api.js";

const lexiconApi = new LexiconApi({
	baseUrl: config.ENV.API.ORIGIN_URL,
	http,
	storage,
});

export { lexiconApi };

export { /** @public */ actions, reducer } from "./slices/lexicon.js";
