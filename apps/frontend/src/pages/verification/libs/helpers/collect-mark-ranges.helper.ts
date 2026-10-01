import { FIRST_INDEX } from "~/libs/constants/constants.js";

import {
	ILLEGIBLE_MARKER,
	UNCERTAIN_SUFFIX,
} from "../constants/verification.constants.js";
import {
	type MarkKind,
	type MarkRange,
	type MarkTextPayload,
} from "../types/types.js";

const MARKER_PATTERN = /[^\s|()]{1,64}\(\?\)|\[\?\]|\[\.\.\.\]/g;

const getMarkerKind = (marker: string): MarkKind => {
	if (marker.endsWith(UNCERTAIN_SUFFIX)) {
		return "uncertain";
	}

	return marker === ILLEGIBLE_MARKER ? "illegible" : "lost";
};

const collectMarkRanges = ({
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

export { collectMarkRanges };
