import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";

import { LEXICON_TIP } from "../constants/verification.constants.js";

const getLexiconTip = (seenOnPages: number): string => {
	const unit =
		seenOnPages === ONE_QUANTITY ? LEXICON_TIP.PAGE : LEXICON_TIP.PAGES;

	return `${LEXICON_TIP.PREFIX} ${String(seenOnPages)} ${unit}`;
};

export { getLexiconTip };
