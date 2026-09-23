import { EMPTY_LENGTH } from "@transcripta/shared";

import { FIRST_INDEX } from "~/libs/constants/constants.js";

import {
	ILLEGIBLE_MARKER,
	UNREADABLE_TIP,
} from "../constants/verification.constants.js";

const MARKER_PATTERN = /\[\?\]|\[\.\.\.\]/g;

const markUnreadable = (text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const match of text.matchAll(MARKER_PATTERN)) {
		const start = match.index;
		const marker = match[FIRST_INDEX];

		if (start > lastIndex) {
			nodes.push(text.slice(lastIndex, start));
		}

		nodes.push(
			<span
				className="tx-tip verification-transcription__unreadable"
				data-tip={
					marker === ILLEGIBLE_MARKER
						? UNREADABLE_TIP.ILLEGIBLE
						: UNREADABLE_TIP.LOST
				}
				key={start}
			>
				{marker}
			</span>,
		);

		lastIndex = start + marker.length;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
};

export { markUnreadable };
