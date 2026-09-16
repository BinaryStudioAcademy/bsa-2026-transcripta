import { Button } from "~/libs/components/components.js";

import { type DocumentGetPagesItemResponseDto } from "../types/types.js";
import { VerificationEdit } from "./components.js";

type VerificationWorkspaceProperties = {
	currentPage: DocumentGetPagesItemResponseDto | undefined;
	isCompleted: boolean;
	isEditing: boolean;
	isVerifying: boolean;
	isZoomed: boolean;
	onConfirm: () => void;
	onSkip: () => void;
	onToggleEdit: () => void;
	pageCount?: number | undefined;
};

const VerificationWorkspace: React.FC<VerificationWorkspaceProperties> = ({
	currentPage,
	isCompleted,
	isEditing,
	isVerifying,
	isZoomed,
	onConfirm,
	onSkip,
	onToggleEdit,
	pageCount,
}) => {
	return (
		<div className="tx-split verification-workspace">
			<div className="tx-split-pane verification-scan-pane">
				<div className="verification-scan">
					<span className="verification-scan__placeholder-label">
						scan placeholder
					</span>

					<div
						className={`verification-scan__content ${
							isZoomed ? "verification-scan__content--zoomed" : ""
						}`}
					>
						{currentPage?.imageUrl ? (
							<img
								alt={`Page ${String(currentPage.pageNo)}`}
								className="verification-scan__image"
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
					{currentPage?.transcription ? (
						<>
							<span className="verification-transcription__page">
								page {currentPage.pageNo} of {pageCount}
								{isEditing && " · editing"} {isCompleted && "(last page)"}
							</span>

							{isEditing ? (
								<VerificationEdit
									onCancel={onToggleEdit}
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
						</>
					) : (
						<div className="verification-empty-state">
							<h3>Preparing the next page</h3>
							<p>
								Everything ready has been verified; the model is still reading.
							</p>
							{isCompleted && <p>This is the last page!</p>}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export { VerificationWorkspace };
