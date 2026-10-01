import { EMPTY_LENGTH } from "@transcripta/shared";

import { type MarkKind, type MarkTextPayload } from "../types/types.js";
import { collectMarkRanges } from "./collect-mark-ranges.helper.js";
import { getMarkLabel } from "./get-mark-label.helper.js";
import { getMarkTip } from "./get-mark-tip.helper.js";

const MARK_CLASS_NAME: Record<MarkKind, string> = {
	illegible: "verification-transcription__unreadable",
	lexicon: "verification-transcription__lexicon",
	lost: "verification-transcription__unreadable",
	uncertain: "verification-transcription__uncertain",
};

const markText = (payload: MarkTextPayload): React.ReactNode[] => {
	const { onMarkEnter, onMarkLeave, segment, segmentStart } = payload;
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const range of collectMarkRanges(payload)) {
		if (range.start > lastIndex) {
			nodes.push(segment.slice(lastIndex, range.start));
		}

		nodes.push(
			<span
				className={MARK_CLASS_NAME[range.kind]}
				data-tip={getMarkTip(range)}
				key={`${range.kind}-${String(segmentStart + range.start)}`}
				onPointerEnter={onMarkEnter}
				onPointerLeave={onMarkLeave}
			>
				{getMarkLabel(range, segment)}
			</span>,
		);

		lastIndex = range.end;
	}

	if (lastIndex < segment.length) {
		nodes.push(segment.slice(lastIndex));
	}

	return nodes;
};

export { markText };
