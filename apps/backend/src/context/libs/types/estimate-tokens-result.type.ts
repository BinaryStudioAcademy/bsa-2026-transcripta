import { type ValueOf } from "~/libs/types/types.js";

import { type TokenCountSource } from "../enums/enums.js";

type EstimateTokensResult = {
	source: ValueOf<typeof TokenCountSource>;
	tokens: number;
};

export { type EstimateTokensResult };
