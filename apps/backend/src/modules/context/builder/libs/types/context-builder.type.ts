import { type Preset } from "~/modules/context/libs/types/types.js";

import { type BuiltContext } from "./types.js";

type ContextBuilder = {
	buildContext: ({
		documentId,
		pageNo,
		preset,
	}: {
		documentId: number;
		pageNo: number;
		preset: Preset;
	}) => Promise<BuiltContext>;
};

export { type ContextBuilder };
