import { PageStatus, type ValueOf } from "@transcripta/shared";

type DocumentPageContextWord = {
	end: number;
	lexiconId: number;
	seenOnPages: number;
	start: number;
	word: string;
};

type DocumentPageRow = {
	id: number;
	imageKey: null | string;
	pageNo: number;
	status: ValueOf<typeof PageStatus>;
	thumbKey: null | string;
	transcriptionContextUsed: null | Record<string, unknown>;
	transcriptionId: null | number;
	transcriptionStructured: null | Record<string, unknown>;
	transcriptionText: null | string;
};

type LexiconRow = {
	distinctPages: number;
	id: number;
	valueDisplay: string;
};

export { type DocumentPageContextWord, type DocumentPageRow, type LexiconRow };
