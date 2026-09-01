const NOT_FOUND_INDEX = -1;
const START_INDEX = 0;
const MAX_FILE_NAME_LENGTH = 255;

const sanitizeFileName = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	const hasExtension = lastDotIndex !== NOT_FOUND_INDEX;

	const name = hasExtension
		? fileName.slice(START_INDEX, lastDotIndex)
		: fileName;
	const extension = hasExtension
		? fileName.slice(lastDotIndex).toLowerCase()
		: "";

	const sanitizedName = name
		.trim()
		.replaceAll(/[/\\]/g, "")
		.replaceAll(/\s+/g, " ")
		.slice(START_INDEX, MAX_FILE_NAME_LENGTH);

	return `${sanitizedName}${extension}`;
};

export { sanitizeFileName };
