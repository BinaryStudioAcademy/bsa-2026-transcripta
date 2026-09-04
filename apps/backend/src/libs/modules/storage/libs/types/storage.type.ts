import {
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./types.js";

type Storage = {
	downloadPageImage(key: string): Promise<Buffer>;
	getUploadSignedUrl(
		options: UploadSignedUrlRequest,
	): Promise<UploadSignedUrlResponse>;
};

export { type Storage };
