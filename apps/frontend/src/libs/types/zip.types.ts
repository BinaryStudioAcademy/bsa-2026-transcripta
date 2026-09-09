type ZipArchiveStatus =
	| "invalid_content"
	| "no_images"
	| "too_many_pages"
	| "valid";

type ZipValidationResult = {
	allEntries: string[];
	imageCount: number;
	message: string;
	rejected: string[];
	sortedImages: string[];
	status: ZipArchiveStatus;
};

export type { ZipArchiveStatus, ZipValidationResult };