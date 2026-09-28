import {
	type DeleteByPrefixRequest,
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./types.js";

type Storage = {
	deleteByPrefix(options: DeleteByPrefixRequest): Promise<void>;
	downloadPageImage(key: string): Promise<Buffer>;
	downloadToTempFolder(
		sourceKey: string,
		maxSize?: number,
	): Promise<{
		clear: () => Promise<void>;
		filePath: string;
	}>;
	getExportDownloadSignedUrl(key: string): Promise<string>;
	getReadSignedUrl(key: string): Promise<string>;
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
	uploadExport({
		body,
		contentType,
		key,
	}: {
		body: Buffer;
		contentType: string;
		key: string;
	}): Promise<void>;
};

export { type Storage };
