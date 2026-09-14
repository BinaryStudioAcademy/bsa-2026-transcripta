import { ModelId } from "~/libs/enums/enums.js";
import { type ModelIdValue } from "~/libs/types/types.js";

import { type ModelRate } from "../types/types.js";

const MODEL_RATES: Readonly<Record<ModelIdValue, ModelRate>> = {
	[ModelId.CLAUDE_SONNET_4_5_BEDROCK]: {
		inputUsdPerMillion: 3,
		outputUsdPerMillion: 15,
	},
	[ModelId.CLAUDE_SONNET_4_6_BEDROCK]: {
		inputUsdPerMillion: 3,
		outputUsdPerMillion: 15,
	},
	[ModelId.CLAUDE_SONNET_4_6_DIRECT]: {
		inputUsdPerMillion: 3,
		outputUsdPerMillion: 15,
	},
	[ModelId.NOVA_LITE_BEDROCK]: {
		inputUsdPerMillion: 0.06,
		outputUsdPerMillion: 0.24,
	},
	[ModelId.NOVA_PRO_BEDROCK]: {
		inputUsdPerMillion: 0.8,
		outputUsdPerMillion: 3.2,
	},
};

export { MODEL_RATES };
