import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { type DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";

import { EVERYTHING_VERIFIED } from "../constants/everything-verified.constant.js";
import { LAST_PAGE_AWAITING } from "../constants/last-page-awaiting.constant.js";
import { PREPARING_DOCUMENTS } from "../constants/preparing-documents.constant.js";

type GetPreparingMessageParameters = {
	currentPageNo: number;
	pageCount: number;
	progress: DocumentGetByIdResponseDto["progress"];
};

const getPreparingMessage = ({
	currentPageNo,
	pageCount,
	progress,
}: GetPreparingMessageParameters): string => {
	const pagesAwaiting =
		progress.pagesPending + progress.pagesInWork + progress.pagesReadyToCheck;

	if (
		pagesAwaiting === ONE_QUANTITY &&
		currentPageNo >= pageCount &&
		pageCount > INITIAL_COUNT
	) {
		return LAST_PAGE_AWAITING;
	}

	if (
		progress.pagesVerified > INITIAL_COUNT &&
		progress.pagesReadyToCheck === INITIAL_COUNT
	) {
		return EVERYTHING_VERIFIED;
	}

	return PREPARING_DOCUMENTS;
};

export { getPreparingMessage };
