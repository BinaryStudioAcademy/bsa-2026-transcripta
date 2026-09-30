const NON_ASCII_OR_QUOTE = /[^\u0020-\u007E]|"/g;
const ASCII_REPLACEMENT = "_";

const getAttachmentContentDisposition = (fileName: string): string => {
	const asciiFileName = fileName.replaceAll(
		NON_ASCII_OR_QUOTE,
		ASCII_REPLACEMENT,
	);

	return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

export { getAttachmentContentDisposition };
