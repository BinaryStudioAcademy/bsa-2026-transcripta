import { CHARS_PER_TOKEN, EMPTY_TEXT_LENGTH } from "../constants/constants.js";

const estimateTokensByChars = (text: string): number => {
	if (text.length === EMPTY_TEXT_LENGTH) {
		return EMPTY_TEXT_LENGTH;
	}

	return Math.ceil(text.length / CHARS_PER_TOKEN);
};

export { estimateTokensByChars };
