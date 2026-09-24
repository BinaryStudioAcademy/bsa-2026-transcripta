import { STRING_TYPE_NAME } from "../constants/constants.js";

const isValueOnlyGlossary = (value: unknown): value is string[] => {
	return (
		Array.isArray(value) &&
		value.every((item) => typeof item === STRING_TYPE_NAME)
	);
};

export { isValueOnlyGlossary };
