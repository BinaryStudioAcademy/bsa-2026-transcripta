import {
	LexiconApiPath,
	type LexiconInvalidateRequestDto,
	type LexiconInvalidateResponseDto,
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

class LexiconApi extends BaseHTTPApi {
	public constructor({ baseUrl, http, storage }: Constructor) {
		super({ baseUrl, http, path: APIPath.LEXICON, storage });
	}

	public async invalidate(
		id: number,
		payload: LexiconInvalidateRequestDto,
	): Promise<LexiconInvalidateResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(LexiconApiPath.INVALIDATE, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.POST,
				payload: JSON.stringify(payload),
			},
		);

		return await response.json<LexiconInvalidateResponseDto>();
	}
}

export { LexiconApi };
