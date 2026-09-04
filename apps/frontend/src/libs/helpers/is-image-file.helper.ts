const IMAGE_EXTENSIONS = new Set(["jpeg", "jpg", "png"]);

const EXTENSION_SEPARATOR_OFFSET = 1;

const isImageFile = (filename: string): boolean => {
	const extension = filename
		.slice(filename.lastIndexOf(".") + EXTENSION_SEPARATOR_OFFSET)
		.toLowerCase();

	return IMAGE_EXTENSIONS.has(extension);
};

export { isImageFile };
