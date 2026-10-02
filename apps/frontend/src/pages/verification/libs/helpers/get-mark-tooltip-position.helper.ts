import {
	TOOLTIP_CENTER_DIVISOR,
	TOOLTIP_GAP,
	TOOLTIP_VIEWPORT_MARGIN,
} from "../constants/verification.constants.js";
import {
	type GetMarkTooltipPositionPayload,
	type MarkTooltipPosition,
} from "../types/types.js";

const getMarkTooltipPosition = ({
	anchor,
	bubble,
}: GetMarkTooltipPositionPayload): MarkTooltipPosition => {
	const spaceAbove = anchor.top - bubble.height - TOOLTIP_GAP;
	const spaceBelow =
		window.innerHeight - anchor.bottom - bubble.height - TOOLTIP_GAP;
	const isAbove = spaceAbove >= spaceBelow;
	const top = isAbove ? spaceAbove : anchor.bottom + TOOLTIP_GAP;
	const anchorCentre = anchor.left + anchor.width / TOOLTIP_CENTER_DIVISOR;
	const centredLeft = anchorCentre - bubble.width / TOOLTIP_CENTER_DIVISOR;
	const lastLeft = Math.max(
		window.innerWidth - bubble.width - TOOLTIP_VIEWPORT_MARGIN,
		TOOLTIP_VIEWPORT_MARGIN,
	);
	const lastTop = Math.max(
		window.innerHeight - bubble.height - TOOLTIP_VIEWPORT_MARGIN,
		TOOLTIP_VIEWPORT_MARGIN,
	);

	return {
		left: Math.min(Math.max(centredLeft, TOOLTIP_VIEWPORT_MARGIN), lastLeft),
		top: Math.min(Math.max(top, TOOLTIP_VIEWPORT_MARGIN), lastTop),
	};
};

export { getMarkTooltipPosition };
