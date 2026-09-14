import { type EstimateTokensResult } from "./estimate-tokens-result.type.js";

type EstimateTokensFunction = (
	blocks: string[],
	model: string,
) => Promise<EstimateTokensResult>;

export { type EstimateTokensFunction };
