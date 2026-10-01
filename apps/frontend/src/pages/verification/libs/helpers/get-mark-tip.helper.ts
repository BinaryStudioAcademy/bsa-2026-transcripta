import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";

import { UNREADABLE_TIP } from "../constants/verification.constants.js";
import { type MarkRange } from "../types/types.js";
import { getLexiconTip } from "./get-lexicon-tip.helper.js";

const getMarkTip = ({ kind, seenOnPages }: MarkRange): string => {
	if (kind === "lexicon") {
		return getLexiconTip(seenOnPages ?? ONE_QUANTITY);
	}
	if (kind === "uncertain") {
		return UNREADABLE_TIP.UNCERTAIN;
	}
	return kind === "illegible" ? UNREADABLE_TIP.ILLEGIBLE : UNREADABLE_TIP.LOST;
};

export { getMarkTip };
