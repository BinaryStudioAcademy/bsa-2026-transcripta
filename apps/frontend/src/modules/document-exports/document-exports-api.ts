import { APIPath, ContentType, HTTPMethod } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

import { DocumentExportsApiPath } from "./libs/enums/enums.js";
import { type DocumentExportGetByIdResponseDto } from "./libs/types/types.js";

type Constructor = {
	baseUrl: string;
	http: HTTP;
	storage: Storage;
};

class DocumentExportApi extends BaseHTTPApi {
	public constructor({ baseUrl, http, storage }: Constructor) {
		super({ baseUrl, http, path: APIPath.EXPORTS, storage });
	}

	public async getById(id: number): Promise<DocumentExportGetByIdResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(DocumentExportsApiPath.BY_ID, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.GET,
			},
		);

		return await response.json<DocumentExportGetByIdResponseDto>();
	}
}

export { DocumentExportApi };
