import { useAppDispatch, useEffect } from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import { PollingIntervalsMS } from "~/modules/documents/libs/enums/polling-intervals-ms.enums.js";
import { actions as pageActions } from "~/modules/pages/pages.js";

import {
	IDLE_DOCUMENT_STATUSES,
	MAX_LOADED_PAGES,
	SETTLED_PAGE_STATUSES,
} from "../constants/verification.constants.js";
import { getPagesFrom } from "../helpers/get-pages-from.helper.js";
import { type DocumentGetPagesItemResponseDto } from "../types/types.js";

type UseVerificationPollingParameters = {
	currentPage: DocumentGetPagesItemResponseDto | undefined;
	cursorPageNo: number;
	document: DocumentGetByIdResponseDto | null;
	documentId: number;
	isDocumentDone: boolean;
};

const useVerificationPolling = ({
	currentPage,
	cursorPageNo,
	document,
	documentId,
	isDocumentDone,
}: UseVerificationPollingParameters): void => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!Number.isFinite(documentId) || !document) {
			return;
		}

		const mustRefreshStatus =
			document.status === DocumentStatus.INGESTING ||
			document.status === DocumentStatus.PROCESSING;

		const isPageSettled =
			currentPage !== undefined &&
			SETTLED_PAGE_STATUSES.includes(currentPage.status);
		const isDocumentIdle = IDLE_DOCUMENT_STATUSES.includes(document.status);

		if (
			!mustRefreshStatus &&
			(isDocumentIdle || (isPageSettled && isDocumentDone))
		) {
			return;
		}

		const timeoutId = setInterval(() => {
			void dispatch(
				pageActions.loadPages({
					documentId,
					isBackground: true,
					query: { from: getPagesFrom(cursorPageNo), limit: MAX_LOADED_PAGES },
				}),
			);
			void dispatch(documentActions.pollDocumentById(documentId));
		}, PollingIntervalsMS.DEFAULT);

		return () => {
			clearInterval(timeoutId);
		};
	}, [
		currentPage,
		cursorPageNo,
		dispatch,
		document,
		documentId,
		isDocumentDone,
	]);
};

export { useVerificationPolling };
