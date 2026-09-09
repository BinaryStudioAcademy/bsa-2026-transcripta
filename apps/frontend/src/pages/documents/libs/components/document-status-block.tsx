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

import { DocumentStatus } from "../enums/enums.js";

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

			try {
				await (isPaused
					? dispatch(documentActions.resume(documentId)).unwrap()
					: dispatch(documentActions.pause(documentId)).unwrap());
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error);
			}
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
					label={isPaused ? "Resume" : "Pause"}
					onClick={handleToggleProcessing}
				/>
			)}
		</>
	);
};

export { DocumentStatusBlock };
