import { EMPTY_LENGTH } from "@transcripta/shared";

import { UNCERTAIN_SUFFIX } from "../constants/verification.constants.js";
import { type MarkKind, type MarkTextPayload } from "../types/types.js";
import { collectMarkRanges } from "./collect-mark-ranges.helper.js";
import { getMarkTip } from "./get-mark-tip.helper.js";

const MARK_CLASS_NAME: Record<MarkKind, string> = {
	illegible: "tx-tip verification-transcription__unreadable",
	lexicon: "tx-tip verification-transcription__lexicon",
	lost: "tx-tip verification-transcription__unreadable",
	uncertain: "tx-tip verification-transcription__uncertain",
};

const markText = (payload: MarkTextPayload): React.ReactNode[] => {
	const { segment, segmentStart } = payload;
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const range of collectMarkRanges(payload)) {
		if (range.start > lastIndex) {
			nodes.push(segment.slice(lastIndex, range.start));
		}

		const content = segment.slice(range.start, range.end);

		nodes.push(
			<span
				className={MARK_CLASS_NAME[range.kind]}
				data-tip={getMarkTip(range)}
				key={`${range.kind}-${String(segmentStart + range.start)}`}
			>
				{range.kind === "uncertain"
					? content.slice(EMPTY_LENGTH, -UNCERTAIN_SUFFIX.length)
					: content}
			</span>,
		);

		lastIndex = range.end;
	}

	if (lastIndex < segment.length) {
		nodes.push(segment.slice(lastIndex));
	}

	return nodes;
};

export { MARK_CLASS_NAME, markText };
