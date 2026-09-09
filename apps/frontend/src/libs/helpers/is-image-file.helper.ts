import {
	EXTENSION_SEPARATOR_OFFSET,
	IMAGE_EXTENSIONS,
} from "~/libs/constants/image.constants.js";

const isImageFile = (filename: string): boolean => {
	const extension = filename
		.slice(filename.lastIndexOf(".") + EXTENSION_SEPARATOR_OFFSET)
		.toLowerCase();

	return IMAGE_EXTENSIONS.has(extension);
};

export { isImageFile };
