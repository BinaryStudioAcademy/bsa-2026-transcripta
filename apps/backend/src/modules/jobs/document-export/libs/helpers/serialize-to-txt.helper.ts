import { type PageItem } from "../types/types.js";

const serializeToTxt = (pages: PageItem[]): string => {
	return pages
		.map((page) => {
			const header = `--- Page ${page.page.toString()} [${page.status}] ---`;
			return `${header}\n\n${page.text}\n\n`;
		})
		.join("\n");
};

export { serializeToTxt };
