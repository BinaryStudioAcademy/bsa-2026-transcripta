import Anthropic from "@anthropic-ai/sdk";

import { type BaseSecrets } from "~/libs/modules/secrets/secrets.js";

import {
	ANTHROPIC_KEY_PARAMETER,
	CONTEXT_HASH_SEPARATOR,
} from "./libs/constants/constants.js";
import { TokenCountSource } from "./libs/enums/enums.js";
import {
	estimateTokensByChars,
	hashContext,
	isAnthropicModel,
	resolveAnthropicApiModel,
} from "./libs/helpers/helpers.js";
import { type EstimateTokensResult } from "./libs/types/types.js";

class EstimateTokens {
	private cache = new Map<string, EstimateTokensResult>();

	private secrets: BaseSecrets;

	public constructor(secrets: BaseSecrets) {
		this.secrets = secrets;
	}

	private async countAnthropicTokens(
		text: string,
		model: string,
	): Promise<null | number> {
		const apiKey = await this.secrets.get(ANTHROPIC_KEY_PARAMETER);

		if (apiKey === null) {
			return null;
		}

		try {
			const response = await new Anthropic({
				apiKey,
			}).beta.messages.countTokens({
				messages: [
					{
						content: text,
						role: "user",
					},
				],
				model: resolveAnthropicApiModel(model),
			});

			return response.input_tokens;
		} catch {
			return null;
		}
	}

	public async estimate(
		blocks: string[],
		model: string,
	): Promise<EstimateTokensResult> {
		const cacheKey = hashContext(blocks, model);
		const cached = this.cache.get(cacheKey);

		if (cached !== undefined) {
			return cached;
		}

		const text = blocks.join(CONTEXT_HASH_SEPARATOR);
		let result: EstimateTokensResult;

		if (isAnthropicModel(model)) {
			const exactTokens = await this.countAnthropicTokens(text, model);

			result =
				exactTokens === null
					? {
							source: TokenCountSource.ESTIMATE,
							tokens: estimateTokensByChars(text),
						}
					: {
							source: TokenCountSource.EXACT,
							tokens: exactTokens,
						};
		} else {
			result = {
				source: TokenCountSource.ESTIMATE,
				tokens: estimateTokensByChars(text),
			};
		}

		this.cache.set(cacheKey, result);

		return result;
	}
}

export { EstimateTokens };
