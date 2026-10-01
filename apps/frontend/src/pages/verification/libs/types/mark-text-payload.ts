import { type ContextWord } from "./context-word.type.js";

type MarkTextPayload = {
	contextWords: ContextWord[];
	onMarkEnter: (event: React.PointerEvent<HTMLElement>) => void;
	onMarkLeave: () => void;
	segment: string;
	segmentStart: number;
};

export { type MarkTextPayload };
