import { startTransition } from "react";

import { Button, StatusChip } from "~/libs/components/components.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useOptimistic,
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
		({ documents }) => documents.pauseResumeDataStatus,
	);

	const [optimisticStatus, setOptimisticStatus] = useOptimistic(
		status,
		(_currentStatus, newStatus: ValueOf<typeof DocumentStatus>) => newStatus,
	);

	const isPaused = optimisticStatus === DocumentStatus.PAUSED;
	const isPauseResumeLoading = pauseResumeDataStatus === DataStatus.PENDING;

	const handleToggleProcessing = useCallback(() => {
		startTransition(async () => {
			const targetStatus = isPaused
				? DocumentStatus.PROCESSING
				: DocumentStatus.PAUSED;

			setOptimisticStatus(targetStatus);

			await (isPaused
				? dispatch(documentActions.resume(documentId))
				: dispatch(documentActions.pause(documentId)));
		});
	}, [dispatch, documentId, isPaused, setOptimisticStatus]);

	const showProcessingToggle =
		optimisticStatus === DocumentStatus.PAUSED ||
		optimisticStatus === DocumentStatus.PROCESSING;

	return (
		<>
			<StatusChip status={optimisticStatus} />
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
