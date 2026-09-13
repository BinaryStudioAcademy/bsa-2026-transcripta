import { LeadInPhrase } from "../enums/enums.js";
import { type PageWithText } from "../types/types.js";
import { renderNeighbouringPagesEntry } from "./helpers.js";

const renderNeighbouringPages = (verifiedPages: PageWithText[]): string => {
	return `${LeadInPhrase.NEIGHBOURING_PAGES}:\n${verifiedPages.map((page) => renderNeighbouringPagesEntry(page)).join("\n")}`;
};

export { renderNeighbouringPages };
