import { Button } from "~/libs/components/components.js";
import { getIsMacOs } from "~/libs/helpers/helpers.js";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";

type EditModeProperties = {
	isDisabled?: boolean;
	onCancel: () => void;
	onSave: (text: string) => void;
	text: string;
};

const VerificationEdit: React.FC<EditModeProperties> = ({
	isDisabled = false,
	onCancel,
	onSave,
	text,
}) => {
	const [value, setValue] = useState(text);
	const textareaReference = useRef<HTMLTextAreaElement>(null);
	const isMacOs = getIsMacOs();

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

			const isSaveShortcut = isMacOs
				? event.metaKey && !event.ctrlKey
				: event.ctrlKey && !event.metaKey;

			if (event.key === "Enter" && isSaveShortcut) {
				event.preventDefault();

				if (!isDisabled) {
					onSave(value);
				}
			}
		},
		[isDisabled, onCancel, onSave, value, isMacOs],
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

				<span className="tx-kbdrow">
					<span>
						<kbd className="tx-kbd">
							{isMacOs ? "⌘+Enter" : "Ctrl+Enter"}
						</kbd>
						{" — Save and next"}
					</span>

					<span>
						<kbd className="tx-kbd">Esc</kbd>
						{" — cancel"}
					</span>
				</span>
			</div>
		</div>
	);
};

export { VerificationEdit };
