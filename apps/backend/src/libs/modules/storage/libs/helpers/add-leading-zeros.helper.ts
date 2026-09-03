import { PAGE_FILE_NAME_LENGTH } from "../constants/constants.js";

const addLeadingZeros = (
	value: number,
	totalLength: number = PAGE_FILE_NAME_LENGTH,
): string => {
	return String(value).padStart(totalLength, "0");
};

export { addLeadingZeros };
