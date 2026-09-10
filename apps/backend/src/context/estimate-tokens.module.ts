import Anthropic from "@anthropic-ai/sdk";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type BaseSecrets } from "~/libs/modules/secrets/secrets.js";

import {
	ANTHROPIC_KEY_PARAMETER,
	CONTEXT_HASH_SEPARATOR,
	COUNT_TOKENS_FALLBACK_MESSAGE,
	TOKEN_CACHE_MAX_SIZE,
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

	private logger: Logger;

	private secrets: BaseSecrets;

	public constructor(secrets: BaseSecrets, logger: Logger) {
		this.secrets = secrets;
		this.logger = logger;
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
		} catch (error: unknown) {
			this.logger.warn(COUNT_TOKENS_FALLBACK_MESSAGE, { error, model });

			return null;
		}
	}

	private getCached(cacheKey: string): EstimateTokensResult | undefined {
		const cached = this.cache.get(cacheKey);

		if (cached === undefined) {
			return undefined;
		}

		this.cache.delete(cacheKey);
		this.cache.set(cacheKey, cached);

		return cached;
	}

	private setCached(cacheKey: string, result: EstimateTokensResult): void {
		if (this.cache.has(cacheKey)) {
			this.cache.delete(cacheKey);
		} else if (this.cache.size >= TOKEN_CACHE_MAX_SIZE) {
			const oldestKey = this.cache.keys().next().value;

			if (oldestKey !== undefined) {
				this.cache.delete(oldestKey);
			}
		}

		this.cache.set(cacheKey, result);
	}

	public async estimate(
		blocks: string[],
		model: string,
	): Promise<EstimateTokensResult> {
		const cacheKey = hashContext(blocks, model);
		const cached = this.getCached(cacheKey);

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

		this.setCached(cacheKey, result);

		return result;
	}
}

export { EstimateTokens };
