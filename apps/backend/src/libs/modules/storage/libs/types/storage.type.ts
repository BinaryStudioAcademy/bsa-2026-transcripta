import {
	type DeleteByPrefixRequest,
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./types.js";

type Storage = {
	deleteByPrefix(options: DeleteByPrefixRequest): Promise<void>;
	downloadToTempFolder(sourceKey: string): Promise<{
		clear: () => Promise<void>;
		filePath: string;
	}>;
	getUploadSignedUrl(
		options: UploadSignedUrlRequest,
	): Promise<UploadSignedUrlResponse>;
	sendPage({
		documentId,
		page,
		pageImage,
		pageThumbnail,
	}: {
		documentId: number;
		page: number;
		pageImage: Buffer;
		pageThumbnail: Buffer;
	}): Promise<{
		imageKey: string;
		thumbnailKey: string;
	}>;
};

export { type Storage };
