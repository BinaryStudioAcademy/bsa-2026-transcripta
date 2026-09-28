import {
	Button,
	FailedStateCard,
	PreparingStateCard,
} from "~/libs/components/components.js";
import { useRef } from "~/libs/hooks/hooks.js";

import {
	EVERYTHING_VERIFIED,
	PREPARING_DOCUMENTS,
} from "../constants/constants.js";
import { PageStatus } from "../enums/enums.js";
import { getFailedReason } from "../helpers/get-failed-reason.helper.js";
import { useDragToPan } from "../hooks/use-drag-to-pan.hook.js";
import { useResizableSplit } from "../hooks/use-resizable-split.js";
import {
	type DocumentGetPagesItemResponseDto,
	type EditConflictDraft,
} from "../types/types.js";
import { VerificationEdit, VerificationPageText } from "./components.js";

type VerificationWorkspaceProperties = {
	currentPage: DocumentGetPagesItemResponseDto | undefined;
	editConflictDraft: EditConflictDraft | null;
	hasVerifiedPages: boolean;
	isCompleted: boolean;
	isEditing: boolean;
	isPauseDisabled: boolean;
	isReprocessing: boolean;
	isZoomed: boolean;
	onConfirm: () => void;
	onPause: () => void;
	onReRead: () => void;
	onSaveEdit: (text: string) => void;
	onSkip: () => void;
	onToggleEdit: () => void;
	pageCount?: number | undefined;
	scanRef: (node: HTMLDivElement | null) => void;
	zoom: number;
};

const VerificationWorkspace: React.FC<VerificationWorkspaceProperties> = ({
	currentPage,
	editConflictDraft,
	hasVerifiedPages,
	isCompleted,
	isEditing,
	isPauseDisabled,
	isReprocessing,
	isZoomed,
	onConfirm,
	onPause,
	onReRead,
	onSaveEdit,
	onSkip,
	onToggleEdit,
	pageCount,
	scanRef,
	zoom,
}) => {
	const viewportReference = useRef<HTMLDivElement>(null);
	const {
		handlePointerCancel,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		isDragging: isPanDragging,
	} = useDragToPan({
		isEnabled: isZoomed,
		viewportReference,
	});
	const {
		handleDividerPointerDown,
		handleDividerPointerMove,
		handleDividerPointerUp,
		isDragging: isDividerDragging,
		splitPosition,
	} = useResizableSplit();

	const workspaceContent = (() => {
		if (currentPage?.status === PageStatus.FAILED) {
			if (isEditing) {
				return (
					<>
						<span className="verification-transcription__page">
							page {currentPage.pageNo} of {pageCount} · typing by hand
						</span>

						<VerificationEdit
							onCancel={onToggleEdit}
							onSave={onSaveEdit}
							text=""
						/>
					</>
				);
			}

			return (
				<div className="verification-failed-state">
					<FailedStateCard
						attempts={currentPage.attempts}
						isLoading={isReprocessing}
						onReRead={onReRead}
						onTypeByHand={onToggleEdit}
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
							onCancel={onToggleEdit}
							onSave={onSaveEdit}
							text={currentPage.transcription.text}
						/>
					) : (
						<>
							<VerificationPageText text={currentPage.transcription.text} />

							<div className="verification-actions">
								<Button
									isPrimary={true}
									label="Confirm"
									onClick={onConfirm}
									type="button"
								/>

								<Button
									isSecondary={true}
									label="Correct"
									onClick={onToggleEdit}
									type="button"
								/>

								<Button label="Skip" onClick={onSkip} type="button" />
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

		const preparingMessage = hasVerifiedPages
			? EVERYTHING_VERIFIED
			: PREPARING_DOCUMENTS;

		return (
			<div className="verification-preparing-state">
				<PreparingStateCard
					isPauseDisabled={isPauseDisabled}
					message={preparingMessage}
					onPause={onPause}
				/>
			</div>
		);
	})();

	return (
		<div className="tx-split verification-workspace">
			<div
				className="tx-split-pane tx-split-pane--fixed verification-scan-pane"
				style={{
					width: `${String(splitPosition)}%`,
				}}
			>
				<div className="verification-scan" ref={viewportReference}>
					{!currentPage?.imageUrl && (
						<span className="verification-scan__placeholder-label">
							scan placeholder
						</span>
					)}

					<div
						className={`verification-scan__content ${
							isZoomed ? "verification-scan__content--zoomed" : ""
						} ${isPanDragging ? "verification-scan__content--dragging" : ""}`}
						onPointerCancel={handlePointerCancel}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						ref={scanRef}
						style={{ transform: `scale(${String(zoom)})` }}
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

			<div
				className={`tx-split-divider ${isDividerDragging ? "is-dragging" : ""}`}
				onPointerDown={handleDividerPointerDown}
				onPointerMove={handleDividerPointerMove}
				onPointerUp={handleDividerPointerUp}
			>
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
