import { type MarkTooltipState } from "./mark-tooltip-state.type.js";

type UseMarkTooltipReturn = {
	hideMarkTooltip: () => void;
	markTooltip: MarkTooltipState | null;
	showMarkTooltip: (event: React.PointerEvent<HTMLElement>) => void;
};

export { type UseMarkTooltipReturn };
