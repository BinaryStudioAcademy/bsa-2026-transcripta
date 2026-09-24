import { APIPath, ContentType, HTTPMethod } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

import { PresetsApiPath } from "./libs/enums/enums.js";
import {
	type PresetGetAllResponseDto,
	type PresetGetByIdResponseDto,
} from "./libs/types/types.js";

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

	public async getById(id: number): Promise<PresetGetByIdResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(PresetsApiPath.BY_ID, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.GET,
			},
		);

		return await response.json<PresetGetByIdResponseDto>();
	}
}

export { PresetApi };
