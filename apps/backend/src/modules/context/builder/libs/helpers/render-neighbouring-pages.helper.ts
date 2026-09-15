import { LeadInPhrase } from "../enums/enums.js";

const renderNeighbouringPages = (verifiedPages: string): string => {
	return `${LeadInPhrase.NEIGHBOURING_PAGES}:\n${verifiedPages}`;
};

export { renderNeighbouringPages };
