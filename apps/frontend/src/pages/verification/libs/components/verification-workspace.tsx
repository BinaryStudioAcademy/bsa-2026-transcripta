import { Button, FailedStateCard } from "~/libs/components/components.js";
<<<<<<< HEAD
import { useRef } from "~/libs/hooks/hooks.js";
=======
import { useEffect, useRef } from "~/libs/hooks/hooks.js";
>>>>>>> 366260c (TSA-336: + drag-to-pan for zoomed scan)

import { INITIAL_ZOOM } from "../constants/verification.constants.js";
import { PageStatus } from "../enums/enums.js";
import { getFailedReason } from "../helpers/get-failed-reason.helper.js";
import { useDragToPan } from "../hooks/use-drag-to-pan.hook.js";
<<<<<<< HEAD
=======
import { useResizableSplit } from "../hooks/use-resizable-split.js";
import { useScanZoom } from "../hooks/use-scan-zoom.js";
>>>>>>> 366260c (TSA-336: + drag-to-pan for zoomed scan)
import {
	type DocumentGetPagesItemResponseDto,
	type EditConflictDraft,
} from "../types/types.js";
import { VerificationEdit } from "./components.js";

type VerificationWorkspaceProperties = {
	currentPage: DocumentGetPagesItemResponseDto | undefined;
	editConflictDraft: EditConflictDraft | null;
	isCompleted: boolean;
	isEditing: boolean;
	isReprocessing: boolean;
	isVerifying: boolean;
	isZoomed: boolean;
	onConfirm: () => void;
	onReRead: () => void;
	onSaveEdit: (text: string) => void;
	onSkip: () => void;
	onToggleEdit: () => void;
	pageCount?: number | undefined;
};

const VerificationWorkspace: React.FC<VerificationWorkspaceProperties> = ({
	currentPage,
	editConflictDraft,
	isCompleted,
	isEditing,
	isReprocessing,
	isVerifying,
	isZoomed,
	onConfirm,
	onReRead,
	onSaveEdit,
	onSkip,
	onToggleEdit,
	pageCount,
}) => {
	const viewportReference = useRef<HTMLDivElement>(null);

	const {
		handlePointerCancel,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		isDragging,
<<<<<<< HEAD
	} = useDragToPan({
		isEnabled: isZoomed,
		viewportReference,
	});
=======
		splitPosition,
	} = useResizableSplit();
	const viewportReference = useRef<HTMLDivElement>(null);
	const { resetToTopLeft, scanRef, zoom } = useScanZoom();
	const isZoomedViewport = isZoomed || zoom > INITIAL_ZOOM;
	const {
		handlePointerCancel,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		isDragging: isPanning,
	} = useDragToPan({
		isEnabled: isZoomedViewport,
		viewportReference,
	});

	useEffect(() => {
		if (isZoomedViewport) {
			resetToTopLeft();
		}
	}, [isZoomedViewport, resetToTopLeft]);
>>>>>>> 366260c (TSA-336: + drag-to-pan for zoomed scan)

	const workspaceContent = (() => {
		if (currentPage?.status === PageStatus.FAILED) {
			return (
				<div className="verification-failed-state">
					<FailedStateCard
						attempts={currentPage.attempts}
						isLoading={isReprocessing}
						onReRead={onReRead}
						reason={getFailedReason(currentPage.lastError)}
					/>
				</div>
			);
		}

		if (currentPage?.transcription) {
			return (
				<>
					<span className="verification-transcription__page">
						page {currentPage.pageNo} of {pageCount}
						{isEditing && " · editing"} {isCompleted && "(last page)"}
					</span>

					{isEditing ? (
						<VerificationEdit
							isDisabled={isVerifying}
							onCancel={onToggleEdit}
							onSave={onSaveEdit}
							text={currentPage.transcription.text}
						/>
					) : (
						<>
							<p className="verification-transcription__text">
								{currentPage.transcription.text}
							</p>

							<div className="verification-actions">
								<Button
									isDisabled={isVerifying}
									isPrimary={true}
									label="Correct"
									onClick={onConfirm}
									type="button"
								/>

								<Button
									isDisabled={isVerifying}
									isSecondary={true}
									label="Edit"
									onClick={onToggleEdit}
									type="button"
								/>

								<Button
									isDisabled={isVerifying}
									label="Skip"
									onClick={onSkip}
									type="button"
								/>
							</div>
						</>
					)}
					{editConflictDraft?.pageNo === currentPage.pageNo && (
						<div className="verification-transcription__draft">
							<strong>Your previous draft:</strong>
							<p>{editConflictDraft.text}</p>
						</div>
					)}
				</>
			);
		}

		return (
			<div className="verification-empty-state">
				<h3>Preparing the next page</h3>
				<p>Everything ready has been verified; the model is still reading.</p>
				{isCompleted && <p>This is the last page!</p>}
			</div>
		);
	})();

	return (
		<div className="tx-split verification-workspace">
			<div className="tx-split-pane verification-scan-pane">
				<div className="verification-scan" ref={viewportReference}>
					<span className="verification-scan__placeholder-label">
						scan placeholder
					</span>

					<div
						className={`verification-scan__content ${
<<<<<<< HEAD
							isZoomed ? "verification-scan__content--zoomed" : ""
						} ${isDragging ? "verification-scan__content--dragging" : ""}`}
=======
							isZoomedViewport ? "verification-scan__content--zoomed" : ""
						} ${isPanning ? "verification-scan__content--dragging" : ""}`}
>>>>>>> 366260c (TSA-336: + drag-to-pan for zoomed scan)
						onPointerCancel={handlePointerCancel}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
<<<<<<< HEAD
=======
						ref={(node) => {
							scanRef.current = node;
							viewportReference.current =
								node?.parentElement instanceof HTMLDivElement
									? node.parentElement
									: null;
						}}
>>>>>>> 366260c (TSA-336: + drag-to-pan for zoomed scan)
					>
						{currentPage?.imageUrl ? (
							<img
								alt={`Page ${String(currentPage.pageNo)}`}
								className="verification-scan__image"
								draggable={false}
								src={currentPage.imageUrl}
							/>
						) : (
							<div className="verification-scan__text">No scan available</div>
						)}
					</div>
				</div>
			</div>

			<div className="tx-split-divider">
				<span className="tx-split-grip" />
			</div>

			<div className="tx-split-pane">
				<section className="verification-transcription">
					{workspaceContent}
				</section>
			</div>
		</div>
	);
};

export { VerificationWorkspace };
