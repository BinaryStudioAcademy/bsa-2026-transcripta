import { type MarkKind } from "./mark-kind.type.js";

type MarkRange = {
	end: number;
	kind: MarkKind;
	seenOnPages?: number;
	start: number;
};

export { type MarkRange };
