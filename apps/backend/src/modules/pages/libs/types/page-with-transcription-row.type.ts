import { PageStatus, type ValueOf } from "@transcripta/shared";

type PageWithTranscriptionRow = {
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

export { type PageWithTranscriptionRow };
