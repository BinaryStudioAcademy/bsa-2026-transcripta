import { STRING_TYPE_NAME } from "../constants/constants.js";

const isStringArray = (value: unknown): value is string[] => {
	return (
		Array.isArray(value) &&
		value.every((item) => typeof item === STRING_TYPE_NAME)
	);
};

export { isStringArray };
