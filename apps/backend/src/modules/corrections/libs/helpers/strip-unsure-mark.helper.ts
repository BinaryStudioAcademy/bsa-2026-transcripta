import { UNSURE_MARK_PATTERN } from "../constants/constants.js";

const stripUnsureMark = (word: string): string =>
	word.replace(UNSURE_MARK_PATTERN, "");

export { stripUnsureMark };
