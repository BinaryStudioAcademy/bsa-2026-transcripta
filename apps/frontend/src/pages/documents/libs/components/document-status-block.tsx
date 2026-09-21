import { Button, StatusChip } from "~/libs/components/components.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
} from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

import { DocumentStatus, ToggleProcessingLabel } from "../enums/enums.js";

type Properties = {
	documentId: number;
	status: ValueOf<typeof DocumentStatus>;
};

const DocumentStatusBlock: React.FC<Properties> = ({ documentId, status }) => {
	const dispatch = useAppDispatch();

	const pauseResumeDataStatus = useAppSelector(
		({ documents }) => documents.pauseResumeDataStatuses[documentId],
	);

	const isPaused = status === DocumentStatus.PAUSED;
	const isPauseResumeLoading = pauseResumeDataStatus === DataStatus.PENDING;

	const handleToggleProcessing = useCallback(() => {
		const togglePromise = isPaused
			? dispatch(documentActions.resume(documentId))
			: dispatch(documentActions.pause(documentId));

		void togglePromise.unwrap().then(() => {
			if (isPaused) {
				void dispatch(documentActions.startPolling(documentId));
			}
		});
	}, [dispatch, documentId, isPaused]);

	const showProcessingToggle =
		status === DocumentStatus.PAUSED || status === DocumentStatus.PROCESSING;

	return (
		<>
			<StatusChip status={status} />
			{showProcessingToggle && (
				<Button
					isDisabled={isPauseResumeLoading}
					isPrimary={isPaused}
					label={
						isPaused
							? ToggleProcessingLabel.RESUME
							: ToggleProcessingLabel.PAUSE
					}
					onClick={handleToggleProcessing}
				/>
			)}
		</>
	);
};

export { DocumentStatusBlock };
