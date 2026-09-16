import { type PageWithText } from "../types/types.js";

const renderNeighbouringPagesEntry = (page: PageWithText): string => {
	return `[page ${page.pageNo.toString()}] ${page.text}`;
};

export { renderNeighbouringPagesEntry };
