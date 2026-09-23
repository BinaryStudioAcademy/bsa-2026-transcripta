import { Button } from "~/libs/components/components.js";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";

type EditModeProperties = {
	isDisabled: boolean;
	onCancel: () => void;
	onSave: (text: string) => void;
	text: string;
};

const VerificationEdit: React.FC<EditModeProperties> = ({
	isDisabled,
	onCancel,
	onSave,
	text,
}) => {
	const [value, setValue] = useState(text);
	const textareaReference = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setValue(text);
	}, [text]);

	useEffect(() => {
		textareaReference.current?.focus();
	}, []);

	const handleTextareaChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
			setValue(event.target.value);
		},
		[],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
			if (event.key === "Escape") {
				event.preventDefault();
				onCancel();
				return;
			}

			if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();

				if (!isDisabled) {
					onSave(value);
				}
			}
		},
		[isDisabled, onCancel, onSave, value],
	);

	const handleSave = useCallback((): void => {
		if (!isDisabled) {
			onSave(value);
		}
	}, [isDisabled, onSave, value]);

	return (
		<div className="verification-edit">
			<textarea
				className="tx-input verification-edit__textarea"
				disabled={isDisabled}
				onChange={handleTextareaChange}
				onKeyDown={handleKeyDown}
				ref={textareaReference}
				value={value}
			/>

			<div className="verification-edit__actions">
				<Button
					isDisabled={isDisabled}
					isPrimary={true}
					label="Save and next"
					onClick={handleSave}
					type="button"
				/>

				<span>
					<kbd className="tx-kbd">Ctrl/⌘+Enter</kbd>
					{" — Save and next"}
				</span>

				<Button isDisabled={isDisabled} onClick={onCancel} type="button">
					<kbd className="tx-kbd">Esc</kbd>
					{" — cancel"}
				</Button>
			</div>
		</div>
	);
};

export { VerificationEdit };
