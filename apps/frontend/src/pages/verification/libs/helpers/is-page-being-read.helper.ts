import { type DocumentGetPagesItemResponseDto } from "~/modules/documents/documents.js";

import { READING_PAGE_STATUSES } from "../constants/verification.constants.js";

const isPageBeingRead = (
	page: DocumentGetPagesItemResponseDto | undefined,
): boolean => page !== undefined && READING_PAGE_STATUSES.includes(page.status);

export { isPageBeingRead };
