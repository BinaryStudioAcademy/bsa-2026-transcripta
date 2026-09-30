import {
	BYTES_IN_KILOBYTE,
	KILOBYTES_IN_MEGABYTE,
} from "../constants/constants.js";

const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE;
const FRACTION_DIGITS = 1;

const formatFileSize = (sizeBytes: number): string => {
	if (sizeBytes < BYTES_IN_KILOBYTE) {
		return `${String(sizeBytes)} B`;
	}

	if (sizeBytes < BYTES_IN_MEGABYTE) {
		return `${(sizeBytes / BYTES_IN_KILOBYTE).toFixed(FRACTION_DIGITS)} KB`;
	}

	return `${(sizeBytes / BYTES_IN_MEGABYTE).toFixed(FRACTION_DIGITS)} MB`;
};

export { formatFileSize };
