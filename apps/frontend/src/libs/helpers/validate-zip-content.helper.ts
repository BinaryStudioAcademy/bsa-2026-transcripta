import { isImageFile } from "./is-image-file.helper.js";
import { naturalSort } from "./natural-sort.helper.js";
import { DEFAULT_MAX_PAGES } from "~/pages/document-new/libs/constants/constants.js";

const PREVIEW_LIMIT = 5;
const EMPTY_LENGTH = 0;
const FIRST_INDEX = 0;

const JUNK_PATTERNS = [/__MACOSX/, /\.DS_Store$/, /Thumbs\.db$/];

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

const isJunkEntry = (entry: string): boolean => {
	return JUNK_PATTERNS.some((pattern) => {
		return pattern.test(entry);
	});
};

const formatPreview = (entries: string[]): string => {
	const preview = entries.slice(FIRST_INDEX, PREVIEW_LIMIT).join(", ");

	if (entries.length > PREVIEW_LIMIT) {
		const extraCount = String(entries.length - PREVIEW_LIMIT);

		return `${preview} + ${extraCount} more`;
	}

	return preview;
};

const validateZipContent = (
	entries: string[],
	maxPages: number = DEFAULT_MAX_PAGES,
): ZipValidationResult => {
	const rejected: string[] = [];
	const imageEntries: string[] = [];
	const allEntries: string[] = [];

	for (const entry of entries) {
		allEntries.push(entry);

		if (isJunkEntry(entry)) {
			continue;
		}

		if (entry.endsWith("/")) {
			continue;
		}

		if (!isImageFile(entry)) {
			rejected.push(entry);
			continue;
		}

		imageEntries.push(entry);
	}

	if (imageEntries.length === EMPTY_LENGTH) {
		const rejectedPreview =
			rejected.length > EMPTY_LENGTH ? formatPreview(rejected) : "";
		const message =
			rejected.length > EMPTY_LENGTH
				? `No image files found in the archive: ${rejectedPreview}.`
				: "No image files found in the archive.";

		return {
			allEntries,
			imageCount: EMPTY_LENGTH,
			message,
			rejected,
			sortedImages: [],
			status: "no_images",
		};
	}

	if (imageEntries.length > maxPages) {
		const imageCount = String(imageEntries.length);
		const pageLimit = String(maxPages);

		return {
			allEntries,
			imageCount: imageEntries.length,
			message: `Archive contains ${imageCount} images, exceeding the ${pageLimit} page limit.`,
			rejected,
			sortedImages: [],
			status: "too_many_pages",
		};
	}

	if (rejected.length > EMPTY_LENGTH) {
		return {
			allEntries,
			imageCount: imageEntries.length,
			message: `Archive rejected: non-image files found: ${formatPreview(rejected)}.`,
			rejected,
			sortedImages: [],
			status: "invalid_content",
		};
	}

	const sortedImages = [...imageEntries].sort(naturalSort);
	const validImageCount = String(sortedImages.length);

	return {
		allEntries,
		imageCount: sortedImages.length,
		message: `Valid ZIP: ${validImageCount} images ready for PDF generation.`,
		rejected,
		sortedImages,
		status: "valid",
	};
};

export { validateZipContent, type ZipValidationResult };
