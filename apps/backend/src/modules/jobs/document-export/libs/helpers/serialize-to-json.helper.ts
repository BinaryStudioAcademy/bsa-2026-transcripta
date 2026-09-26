import { JSON_INDENTATION } from "../constants/constants.js";
import { type PageItem } from "../types/types.js";

const serializeToJson = (pages: PageItem[]): string => {
	return JSON.stringify(pages, null, JSON_INDENTATION);
};

export { serializeToJson };
