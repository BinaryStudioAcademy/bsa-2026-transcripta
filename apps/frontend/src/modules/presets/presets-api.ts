import {
	type PresetGetAllResponseDto,
	PresetsApiPath,
} from "@transcripta/shared";

import { APIPath, ContentType, HTTPMethod } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

type Constructor = {
	baseUrl: string;
	http: HTTP;
	storage: Storage;
};

class PresetApi extends BaseHTTPApi {
	public constructor({ baseUrl, http, storage }: Constructor) {
		super({ baseUrl, http, path: APIPath.PRESETS, storage });
	}

	public async getAll(): Promise<PresetGetAllResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(PresetsApiPath.ROOT, {}),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.GET,
			},
		);

		return await response.json<PresetGetAllResponseDto>();
	}
}

export { PresetApi };
