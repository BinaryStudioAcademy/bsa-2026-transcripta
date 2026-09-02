import {
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./types.js";

type Storage = {
	getReadSignedUrl(key: string): Promise<string>;
	getUploadSignedUrl(
		options: UploadSignedUrlRequest,
	): Promise<UploadSignedUrlResponse>;
};

export { type Storage };
