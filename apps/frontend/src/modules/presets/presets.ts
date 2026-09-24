import { config } from "~/libs/modules/config/config.js";
import { http } from "~/libs/modules/http/http.js";
import { storage } from "~/libs/modules/storage/storage.js";

import { PresetApi } from "./presets-api.js";

const presetApi = new PresetApi({
	baseUrl: config.ENV.API.ORIGIN_URL,
	http,
	storage,
});

export { presetApi };

export { /** @public */ actions, reducer } from "./slices/presets.js";
