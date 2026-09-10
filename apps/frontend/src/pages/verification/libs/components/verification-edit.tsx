import { useCallback, useState } from "~/libs/hooks/hooks.js";

type EditModeProperties = {
	onCancel: () => void;
	text: string;
};

const VerificationEdit: React.FC<EditModeProperties> = ({ onCancel, text }) => {
	const [value, setValue] = useState(text);

	const handleTextareaChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
			setValue(event.target.value);
		},
		[],
	);

	return (
		<div className="verification-edit">
			<textarea
				className="tx-input verification-edit__textarea"
				onChange={handleTextareaChange}
				rows={5}
				value={value}
			/>

			<div className="verification-edit__actions">
				<button className="tx-btn tx-btn--primary" type="button">
					Save and next
				</button>

				<span>
					<kbd className="tx-kbd">Ctrl+Enter</kbd>
					{" — Save and next"}
				</span>

				<button
					className="tx-btn tx-btn--ghost"
					onClick={onCancel}
					type="button"
				>
					<kbd className="tx-kbd">Esc</kbd>
					{" — cancel"}
				</button>
			</div>
		</div>
	);
};

export { VerificationEdit };
