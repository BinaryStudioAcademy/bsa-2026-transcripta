import { APIPath, ContentType } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

import { DocumentsApiPath } from "./libs/enums/enums.js";
import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllResponseDto,
} from "./libs/types/types.js";

type Constructor = {
	baseUrl: string;
	http: HTTP;
	storage: Storage;
};

class DocumentApi extends BaseHTTPApi {
	public constructor({ baseUrl, http, storage }: Constructor) {
		super({ baseUrl, http, path: APIPath.DOCUMENTS, storage });
	}

	public async create(
		payload: DocumentCreateRequestDto,
	): Promise<DocumentCreateResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(DocumentsApiPath.ROOT, {}),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: "POST",
				payload: JSON.stringify(payload),
			},
		);

		return await response.json<DocumentCreateResponseDto>();
	}

	public async getAll(): Promise<DocumentGetAllResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(DocumentsApiPath.ROOT, {}),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: "GET",
			},
		);

		return await response.json<DocumentGetAllResponseDto>();
	}

	public async ingest(documentId: number): Promise<void> {
		await this.load(this.getFullEndpoint(`/${String(documentId)}/ingest`, {}), {
			contentType: ContentType.JSON,
			hasAuth: true,
			method: "POST",
		});
	}

	public async uploadFile(uploadUrl: string, file: File): Promise<void> {
		const response = await fetch(uploadUrl, {
			body: file,
			method: "PUT",
		});

		if (!response.ok) {
			throw new Error("The document could not be uploaded to storage.");
		}
	}
}

export { DocumentApi };
