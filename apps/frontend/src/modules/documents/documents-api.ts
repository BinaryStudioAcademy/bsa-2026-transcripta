import { APIPath, ContentType, HTTPMethod } from "~/libs/enums/enums.js";
import { BaseHTTPApi } from "~/libs/modules/api/api.js";
import { type HTTP } from "~/libs/modules/http/http.js";
import { type Storage } from "~/libs/modules/storage/storage.js";

import { DocumentsApiPath } from "./libs/enums/enums.js";
import {
	type DocumentCreateRequestDto,
	type DocumentCreateResponseDto,
	type DocumentGetAllResponseDto,
	type DocumentGetByIdResponseDto,
	type DocumentUploadUrlRequestDto,
	type DocumentUploadUrlResponseDto,
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
				method: HTTPMethod.POST,
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
				method: HTTPMethod.GET,
			},
		);

		return await response.json<DocumentGetAllResponseDto>();
	}

	public async getById(id: number): Promise<DocumentGetByIdResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(DocumentsApiPath.BY_ID, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.GET,
			},
		);

		return await response.json<DocumentGetByIdResponseDto>();
	}

	public async getUploadUrl(
		id: number,
		payload?: DocumentUploadUrlRequestDto,
		signal?: AbortSignal,
	): Promise<DocumentUploadUrlResponseDto> {
		const response = await this.load(
			this.getFullEndpoint(DocumentsApiPath.UPLOAD_URL, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.POST,
				payload: JSON.stringify(payload ?? {}),
				...(signal ? { signal } : {}),
			},
		);

		return await response.json<DocumentUploadUrlResponseDto>();
	}

	public async ingest(id: number): Promise<void> {
		await this.load(
			this.getFullEndpoint(DocumentsApiPath.INGEST, {
				id: String(id),
			}),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.POST,
				payload: JSON.stringify({}),
			},
		);
	}

	public async remove(id: number): Promise<void> {
		await this.load(
			this.getFullEndpoint(DocumentsApiPath.BY_ID, { id: String(id) }),
			{
				contentType: ContentType.JSON,
				hasAuth: true,
				method: HTTPMethod.DELETE,
			},
		);
	}
}

export { DocumentApi };
