import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { type DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";

import { EVERYTHING_VERIFIED } from "../constants/everything-verified.constant.js";
import { PREPARING_DOCUMENTS } from "../constants/preparing-documents.constant.js";

const getPreparingMessage = (
	progress: DocumentGetByIdResponseDto["progress"],
): string => {
	if (
		progress.pagesVerified > INITIAL_COUNT &&
		progress.pagesReadyToCheck === INITIAL_COUNT
	) {
		return EVERYTHING_VERIFIED;
	}

	return PREPARING_DOCUMENTS;
};

export { getPreparingMessage };
