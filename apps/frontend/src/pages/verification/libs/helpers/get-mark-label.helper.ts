import { EMPTY_LENGTH } from "@transcripta/shared";

import { UNCERTAIN_SUFFIX } from "../constants/verification.constants.js";
import { type MarkRange } from "../types/types.js";

const getMarkLabel = (range: MarkRange, text: string): string => {
	const content = text.slice(range.start, range.end);

	return range.kind === "uncertain"
		? content.slice(EMPTY_LENGTH, -UNCERTAIN_SUFFIX.length)
		: content;
};

export { getMarkLabel };
