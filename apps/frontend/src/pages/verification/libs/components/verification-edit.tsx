import { EMPTY_LENGTH } from "@transcripta/shared";

import { Button } from "~/libs/components/components.js";
import { getIsMacOs } from "~/libs/helpers/helpers.js";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";

import { MARKED_WORDS_LABEL } from "../constants/verification.constants.js";
import { collectMarkRanges } from "../helpers/collect-mark-ranges.helper.js";
import { getMarkLabel } from "../helpers/get-mark-label.helper.js";
import { getMarkTip } from "../helpers/get-mark-tip.helper.js";
import { markRawText } from "../helpers/mark-raw-text.helper.js";
import { normalizeContextWords } from "../helpers/normalize-context-words.helper.js";
import { type ContextWord, type MarkRange } from "../types/types.js";

const ACTIONABLE_KINDS = new Set<MarkRange["kind"]>([
	"illegible",
	"lost",
	"uncertain",
]);

type EditModeProperties = {
	contextWords: ContextWord[];
	isDisabled?: boolean;
	onCancel: () => void;
	onSave: (text: string) => void;
	text: string;
};

const VerificationEdit: React.FC<EditModeProperties> = ({
	contextWords,
	isDisabled = false,
	onCancel,
	onSave,
	text,
}) => {
	const [value, setValue] = useState(text);
	const layerReference = useRef<HTMLDivElement>(null);
	const textareaReference = useRef<HTMLTextAreaElement>(null);
	const isMacOs = getIsMacOs();

	const ranges = useMemo(() => {
		const normalized = normalizeContextWords({ contextWords, text: value });

		return collectMarkRanges({
			contextWords: normalized,
			segment: value,
			segmentStart: EMPTY_LENGTH,
		});
	}, [contextWords, value]);

	const markedItems = useMemo(
		() =>
			ranges
				.filter((range: MarkRange) => ACTIONABLE_KINDS.has(range.kind))
				.map((range: MarkRange) => ({
					label: getMarkLabel(range, value),
					range,
					tip: getMarkTip(range),
				})),
		[ranges, value],
	);

	useEffect(() => {
		setValue(text);
	}, [text]);

	useEffect(() => {
		textareaReference.current?.focus();
	}, []);

	useEffect(() => {
		const handleWindowKeyDown = (event: KeyboardEvent): void => {
			if (event.repeat || event.target === textareaReference.current) {
				return;
			}

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
		};

		globalThis.addEventListener("keydown", handleWindowKeyDown, true);

		return () => {
			globalThis.removeEventListener("keydown", handleWindowKeyDown, true);
		};
	}, [isDisabled, isMacOs, onCancel, onSave, value]);

	const handleTextareaChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>): void => {
			setValue(event.target.value);
		},
		[],
	);

	const handleScroll = useCallback(
		(event: React.UIEvent<HTMLTextAreaElement>): void => {
			const layer = layerReference.current;

			if (layer) {
				layer.scrollTop = event.currentTarget.scrollTop;
			}
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

	const handleMarkClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			const textarea = textareaReference.current;
			const { end, start } = event.currentTarget.dataset;

			if (!textarea || start === undefined || end === undefined) {
				return;
			}

			textarea.focus();
			textarea.setSelectionRange(Number(start), Number(end));
		},
		[],
	);

	const handleSave = useCallback((): void => {
		if (!isDisabled) {
			onSave(value);
		}
	}, [isDisabled, onSave, value]);

	const handleSaveMouseDown = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			event.preventDefault();
		},
		[],
	);

	return (
		<div className="verification-edit">
			<div className="verification-edit__field">
				<div
					aria-hidden="true"
					className={[
						"verification-edit__layer",
						isDisabled && "verification-edit__layer--disabled",
					]
						.filter(Boolean)
						.join(" ")}
					ref={layerReference}
				>
					{markRawText(ranges, value)}
				</div>

				<textarea
					className="tx-input verification-edit__textarea"
					disabled={isDisabled}
					onChange={handleTextareaChange}
					onKeyDown={handleKeyDown}
					onScroll={handleScroll}
					ref={textareaReference}
					value={value}
				/>
			</div>

			{markedItems.length > EMPTY_LENGTH && (
				<div className="verification-edit__marked">
					<span className="verification-edit__marked-title">
						{MARKED_WORDS_LABEL}
					</span>

					{markedItems.map(({ label, range, tip }) => (
						<button
							aria-label={`${tip}: ${label}`}
							className={[
								"tx-chip",
								"tx-tip",
								"verification-edit__marked-item",
								range.kind === "uncertain"
									? "tx-chip--seal"
									: "verification-edit__marked-item--unreadable",
							]
								.filter(Boolean)
								.join(" ")}
							data-end={String(range.end)}
							data-start={String(range.start)}
							data-tip={tip}
							key={range.start}
							onClick={handleMarkClick}
							type="button"
						>
							{label}
						</button>
					))}
				</div>
			)}

			<div className="verification-edit__actions">
				<Button
					isDisabled={isDisabled}
					isPrimary={true}
					label="Save and next"
					onClick={handleSave}
					onMouseDown={handleSaveMouseDown}
					type="button"
				/>

				<span className="tx-kbdrow">
					<span>
						<kbd className="tx-kbd">{isMacOs ? "⌘+Enter" : "Ctrl+Enter"}</kbd>
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
