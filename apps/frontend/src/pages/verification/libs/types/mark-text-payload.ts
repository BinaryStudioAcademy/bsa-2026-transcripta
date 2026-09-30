import { type ContextWord } from "./context-word.type.js";

type MarkTextPayload = {
	contextWords: ContextWord[];
	segment: string;
	segmentStart: number;
};

export { type MarkTextPayload };
