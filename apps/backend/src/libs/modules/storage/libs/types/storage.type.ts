import {
	type DeleteByPrefixRequest,
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./types.js";

type Storage = {
	deleteByPrefix(options: DeleteByPrefixRequest): Promise<void>;
	getUploadSignedUrl(
		options: UploadSignedUrlRequest,
	): Promise<UploadSignedUrlResponse>;
};

export { type Storage };
