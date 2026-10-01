import { MINIMUM_VALID_DOCUMENT_ID } from "~/libs/constants/constants.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
} from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	type DocumentGetByIdResponseDto,
} from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

type UseProcessingToggleReturn = {
	isPaused: boolean;
	isToggleDisabled: boolean;
	isToggleVisible: boolean;
	onToggleProcessing: () => void;
};

const useProcessingToggle = (
	document: DocumentGetByIdResponseDto | null,
): UseProcessingToggleReturn => {
	const dispatch = useAppDispatch();

	const pauseResumeDataStatus = useAppSelector(
		({ documents }) =>
			documents.pauseResumeDataStatuses[
				document?.id ?? MINIMUM_VALID_DOCUMENT_ID
			],
	);

	const isPaused = document?.status === DocumentStatus.PAUSED;
	const isToggleVisible =
		document?.status === DocumentStatus.PROCESSING || isPaused;
	const isToggleDisabled =
		pauseResumeDataStatus === DataStatus.PENDING || !isToggleVisible;

	const onToggleProcessing = useCallback((): void => {
		if (!document || !isToggleVisible) {
			return;
		}

		if (isPaused) {
			void dispatch(documentActions.resume(document.id));

			return;
		}

		void dispatch(documentActions.pause(document.id));
	}, [dispatch, document, isPaused, isToggleVisible]);

	return { isPaused, isToggleDisabled, isToggleVisible, onToggleProcessing };
};

export { useProcessingToggle };
