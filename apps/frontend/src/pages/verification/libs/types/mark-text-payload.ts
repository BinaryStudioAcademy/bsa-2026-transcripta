import { type ContextWord } from "./context-word.type.js";

type MarkRangesPayload = {
	contextWords: ContextWord[];
	segment: string;
	segmentStart: number;
};

type MarkTextPayload = MarkRangesPayload & {
	onMarkEnter: (event: React.PointerEvent<HTMLElement>) => void;
	onMarkLeave: () => void;
};

export { type MarkRangesPayload, type MarkTextPayload };
