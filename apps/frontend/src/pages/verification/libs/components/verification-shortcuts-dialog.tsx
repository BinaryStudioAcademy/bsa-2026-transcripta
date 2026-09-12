type VerificationShortcutsDialogProperties = {
	onClose: () => void;
};

const VerificationShortcutsDialog: React.FC<
	VerificationShortcutsDialogProperties
> = ({ onClose }) => {
	return (
		<div className="tx-scrim">
			<div className="tx-dialog">
				<h2 className="tx-dialog-title">Keyboard shortcuts</h2>

				<div className="tx-dialog-shortcuts">
					<span className="tx-dialog-shortcut-keys">
						<kbd className="tx-kbd">Enter</kbd>
						<kbd className="tx-kbd">→</kbd>
					</span>
					<span>Correct, next</span>

					<kbd className="tx-kbd">←</kbd>
					<span>Previous</span>

					<kbd className="tx-kbd">E</kbd>
					<span>Edit</span>

					<kbd className="tx-kbd">S</kbd>
					<span>Skip</span>

					<kbd className="tx-kbd">Ctrl+Z</kbd>
					<span>Undo</span>

					<kbd className="tx-kbd">Space</kbd>
					<span>Zoom</span>

					<kbd className="tx-kbd">?</kbd>
					<span>This list</span>
				</div>

				<div className="tx-dialog-actions">
					<button
						className="tx-btn tx-btn--secondary"
						onClick={onClose}
						type="button"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export { VerificationShortcutsDialog };
