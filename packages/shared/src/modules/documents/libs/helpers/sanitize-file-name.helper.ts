const NOT_FOUND_INDEX = -1;
const START_INDEX = 0;

const sanitizeFileName = (fileName: string): string => {
	const lastDotIndex = fileName.lastIndexOf(".");
	const hasExtension = lastDotIndex !== NOT_FOUND_INDEX;

	const name = hasExtension
		? fileName.slice(START_INDEX, lastDotIndex)
		: fileName;
	const extension = hasExtension ? fileName.slice(lastDotIndex) : "";

	const sanitizedName = name
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replaceAll(/[\u0300-\u036F]/g, "")
		.replaceAll(/\s+/g, "-")
		.replaceAll(/[^a-z0-9-_]/g, "");

	return `${sanitizedName}${extension}`;
};

export { sanitizeFileName };
