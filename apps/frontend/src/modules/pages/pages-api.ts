import { APIPath, ContentType, HTTPMethod } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

import { PageApiPath } from "./libs/enums/enums.js";
import {
	type VerifyPageRequestDto,
	type VerifyPageResponseDto,
} from "./libs/types/types.js";

type Constructor = {
	baseUrl: string;
	http: HTTP;
	storage: Storage;
};

class PageApi extends BaseHTTPApi {
	public constructor({ baseUrl, http, storage }: Constructor) {
		super({ baseUrl, http, path: APIPath.PAGES, storage });
	}

	public async verify(
		id: number,
		payload: VerifyPageRequestDto,
	): Promise<VerifyPageResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(PageApiPath.VERIFY, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.POST,
				payload: JSON.stringify(payload),
			},
		);

		return await response.json<VerifyPageResponseDto>();
	}
}

export { PageApi };
