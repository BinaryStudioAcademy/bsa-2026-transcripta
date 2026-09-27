import { EMPTY_LENGTH, PageStatusValue } from "@transcripta/shared";

import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";
import { useAppDispatch, useEffect } from "~/libs/hooks/hooks.js";
import { type DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";
import {
	DocumentStatus,
	PollingIntervalsMS,
} from "~/modules/documents/libs/enums/enums.js";
import {
	actions as pageActions,
	PROCESSING_PAGE_STATUSES,
} from "~/modules/pages/pages.js";

import { MAX_LOADED_PAGES } from "../constants/verification.constants.js";
import { getPagesFrom } from "../helpers/get-pages-from.helper.js";

type Parameters = {
	currentPageStatus: PageStatusValue | undefined;
	cursorPageNo: number;
	document: DocumentGetByIdResponseDto | null;
};

const usePagesPolling = ({
	currentPageStatus,
	cursorPageNo,
	document,
}: Parameters): void => {
	const dispatch = useAppDispatch();

	const documentId = document?.id;
	const documentStatus = document?.status;
	const pagesInWork = document?.progress.pagesInWork ?? EMPTY_LENGTH;
	const pagesPending = document?.progress.pagesPending ?? EMPTY_LENGTH;

	useEffect(() => {
		if (documentId === undefined || cursorPageNo < ONE_QUANTITY) {
			return;
		}

		const isCurrentPagePreparing =
			currentPageStatus !== undefined &&
			PROCESSING_PAGE_STATUSES.has(currentPageStatus);

		const hasPagesInFlight =
			pagesInWork > EMPTY_LENGTH || pagesPending > EMPTY_LENGTH;

		const isDocumentStillBuilding =
			documentStatus === DocumentStatus.INGESTING ||
			documentStatus === DocumentStatus.READY;

		const shouldPollPages =
			isCurrentPagePreparing || hasPagesInFlight || isDocumentStillBuilding;
		if (!shouldPollPages) {
			return;
		}

		let isRequestInFlight = false;

		const poll = (): void => {
			if (isRequestInFlight) {
				return;
			}

			isRequestInFlight = true;

			void dispatch(
				pageActions.refreshPages({
					documentId,
					query: {
						from: getPagesFrom(cursorPageNo),
						limit: MAX_LOADED_PAGES,
					},
				}),
			).finally(() => {
				isRequestInFlight = false;
			});
		};

		poll();

		const intervalId = setInterval(poll, PollingIntervalsMS.DEFAULT);

		return (): void => {
			clearInterval(intervalId);
		};
	}, [
		currentPageStatus,
		cursorPageNo,
		dispatch,
		documentId,
		documentStatus,
		pagesInWork,
		pagesPending,
	]);
};

export { usePagesPolling };
