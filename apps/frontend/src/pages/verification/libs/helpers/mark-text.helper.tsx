import { EMPTY_LENGTH } from "@transcripta/shared";

import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";
import { FIRST_INDEX } from "~/libs/constants/constants.js";

import {
	ILLEGIBLE_MARKER,
	UNREADABLE_TIP,
} from "../constants/verification.constants.js";
import {
	type MarkKind,
	type MarkRange,
	type MarkTextPayload,
} from "../types/types.js";
import { getLexiconTip } from "./get-lexicon-tip.helper.js";

const MARKER_PATTERN = /[^\s|()]{1,64}\(\?\)|\[\?\]|\[\.\.\.\]/g;

const UNCERTAIN_SUFFIX = "(?)";

const getMarkerKind = (marker: string): MarkKind => {
	if (marker.endsWith(UNCERTAIN_SUFFIX)) {
		return "uncertain";
	}

	return marker === ILLEGIBLE_MARKER ? "illegible" : "lost";
};

const collectRanges = ({
	contextWords,
	segment,
	segmentStart,
}: MarkTextPayload): MarkRange[] => {
	const markerRanges: MarkRange[] = [];

	for (const match of segment.matchAll(MARKER_PATTERN)) {
		const marker = match[FIRST_INDEX];
		markerRanges.push({
			end: match.index + marker.length,
			kind: getMarkerKind(marker),
			start: match.index,
		});
	}

	const segmentEnd = segmentStart + segment.length;
	const lexiconRanges: MarkRange[] = [];

	for (const contextWord of contextWords) {
		if (contextWord.start < segmentStart || contextWord.end > segmentEnd) {
			continue;
		}

		const start = contextWord.start - segmentStart;
		const end = contextWord.end - segmentStart;
		const overlapsMarker = markerRanges.some(
			(range) => start < range.end && range.start < end,
		);

		if (overlapsMarker) {
			continue;
		}

		lexiconRanges.push({
			end,
			kind: "lexicon",
			seenOnPages: contextWord.seenOnPages,
			start,
		});
	}

	return [...markerRanges, ...lexiconRanges].toSorted(
		(a, b) => a.start - b.start,
	);
};

const getMarkTip = ({ kind, seenOnPages }: MarkRange): string => {
	if (kind === "lexicon") {
		return getLexiconTip(seenOnPages ?? ONE_QUANTITY);
	}
	if (kind === "uncertain") {
		return UNREADABLE_TIP.UNCERTAIN;
	}
	return kind === "illegible" ? UNREADABLE_TIP.ILLEGIBLE : UNREADABLE_TIP.LOST;
};

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

	for (const range of collectRanges(payload)) {
		if (range.start > lastIndex) {
			nodes.push(segment.slice(lastIndex, range.start));
		}

		const content = segment.slice(range.start, range.end);

		nodes.push(
			<span
				className={MARK_CLASS_NAME[range.kind]}
				data-tip={getMarkTip(range)}
				key={`${range.kind}-${String(segmentStart + range.start)}`}
				onPointerEnter={onMarkEnter}
				onPointerLeave={onMarkLeave}
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

export { markText };
