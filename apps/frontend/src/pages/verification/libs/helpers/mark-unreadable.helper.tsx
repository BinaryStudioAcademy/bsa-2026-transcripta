import { EMPTY_LENGTH } from "@transcripta/shared";

import { FIRST_INDEX } from "~/libs/constants/constants.js";

import {
	ILLEGIBLE_MARKER,
	UNREADABLE_TIP,
} from "../constants/verification.constants.js";

const MARKER_PATTERN = /[^\s|()]{1,64}\(\?\)|\[\?\]|\[\.\.\.\]/g;

const UNCERTAIN_SUFFIX = "(?)";

const markUnreadable = (text: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	let lastIndex = EMPTY_LENGTH;

	for (const match of text.matchAll(MARKER_PATTERN)) {
		const start = match.index;
		const marker = match[FIRST_INDEX];

		if (start > lastIndex) {
			nodes.push(text.slice(lastIndex, start));
		}

		const isUncertain = marker.endsWith(UNCERTAIN_SUFFIX);
		const isIllegible = marker === ILLEGIBLE_MARKER;

		let tip: string = UNREADABLE_TIP.LOST;

		if (isUncertain) {
			tip = UNREADABLE_TIP.UNCERTAIN;
		} else if (isIllegible) {
			tip = UNREADABLE_TIP.ILLEGIBLE;
		}

		nodes.push(
			<span
				className={
					isUncertain
						? "tx-tip verification-transcription__uncertain"
						: "tx-tip verification-transcription__unreadable"
				}
				data-tip={tip}
				key={start}
			>
				{isUncertain
					? marker.slice(EMPTY_LENGTH, -UNCERTAIN_SUFFIX.length)
					: marker}
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
