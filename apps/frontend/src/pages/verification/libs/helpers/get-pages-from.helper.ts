import { DIVIDER_HALF } from "~/libs/constants/common.constants.js";

import {
	MAX_LOADED_PAGES,
	MIN_NUMBER_OF_PAGES,
} from "../constants/verification.constants.js";

const PAGES_BEFORE_CURSOR = Math.floor(MAX_LOADED_PAGES / DIVIDER_HALF);

const getPagesFrom = (pageNo: number): number =>
	Math.max(MIN_NUMBER_OF_PAGES, pageNo - PAGES_BEFORE_CURSOR);

export { getPagesFrom };
