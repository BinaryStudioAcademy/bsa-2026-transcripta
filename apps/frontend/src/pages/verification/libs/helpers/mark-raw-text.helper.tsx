import { EMPTY_LENGTH } from "@transcripta/shared";

import { type MarkRange } from "../types/types.js";
import { MARK_CLASS_NAME } from "./mark-text.helper.js";

const markRawText = (ranges: MarkRange[], text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const range of ranges) {
		if (range.start > lastIndex) {
			nodes.push(text.slice(lastIndex, range.start));
		}

		nodes.push(
			<span
				className={MARK_CLASS_NAME[range.kind]}
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
