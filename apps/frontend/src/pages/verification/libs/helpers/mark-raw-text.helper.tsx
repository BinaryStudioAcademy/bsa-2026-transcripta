import { EMPTY_LENGTH } from "@transcripta/shared";

import { type MarkKind, type MarkRange } from "../types/types.js";

// Must not change glyph width: the layer is drawn under a transparent textarea.
const EDIT_MARK_CLASS_NAME: Record<MarkKind, string> = {
	illegible: "verification-edit__mark verification-edit__mark--unreadable",
	lexicon: "verification-edit__mark",
	lost: "verification-edit__mark verification-edit__mark--unreadable",
	uncertain: "verification-edit__mark",
};

const markRawText = (ranges: MarkRange[], text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const range of ranges) {
		if (range.start > lastIndex) {
			nodes.push(text.slice(lastIndex, range.start));
		}

		nodes.push(
			<span
				className={EDIT_MARK_CLASS_NAME[range.kind]}
				key={`${range.kind}-${String(range.start)}`}
			>
				{text.slice(range.start, range.end)}
			</span>,
		);

		lastIndex = range.end;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
};

export { markRawText };
