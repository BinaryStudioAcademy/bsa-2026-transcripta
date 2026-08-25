import Anthropic from "@anthropic-ai/sdk";
import {
	BedrockRuntimeClient,
	InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import { type Config } from "~/libs/modules/config/config.js";
import { type BaseSecrets } from "~/libs/modules/secrets/secrets.js";

import {
	type TranscriptionRequest,
	type TranscriptionResponse,
} from "./libs/types/types.js";

const ANTHROPIC_VERSION = "bedrock-2023-05-31";
const MAX_TOKENS = 8192;
const AMAZON_PREFIX = "amazon";
const PROFILE_SEPARATOR = ".";
const PROFILE_PREFIX_INDEX = 1;
const DIRECT_PREFIX = "anthropic-direct:";
const ANTHROPIC_KEY_PARAMETER = "/transcripta/anthropic-api-key";

type AnthropicPayload = {
	content: { text: string }[];
	usage: { input_tokens: number; output_tokens: number };
};

type NovaPayload = {
	output: { message: { content: { text: string }[] } };
	usage: { inputTokens: number; outputTokens: number };
};

/**
 * Bedrock speaks a different dialect per vendor: Anthropic takes
 * `anthropic_version` plus typed content blocks, Amazon Nova takes
 * `inferenceConfig` and raw image bytes. The vendor sits in the model id
 * after the regional prefix — `us.amazon.nova-pro-v1:0`.
 */
const isNovaModel = (modelId: string): boolean =>
	modelId.split(PROFILE_SEPARATOR)[PROFILE_PREFIX_INDEX] === AMAZON_PREFIX;

class TranscriptionService {
	private client: BedrockRuntimeClient;

	private defaultModelId: string;

	private secrets: BaseSecrets;

	public constructor(config: Config, secrets: BaseSecrets) {
		this.client = new BedrockRuntimeClient({
			region: config.ENV.BEDROCK.REGION,
		});
		this.defaultModelId = config.ENV.BEDROCK.MODEL_ID;
		this.secrets = secrets;
	}

	private buildAnthropicBody(
		image: Buffer,
		mediaType: string,
		prompt: string,
	): string {
		return JSON.stringify({
			anthropic_version: ANTHROPIC_VERSION,
			max_tokens: MAX_TOKENS,
			messages: [
				{
					content: [
						{
							source: {
								data: image.toString("base64"),
								media_type: mediaType,
								type: "base64",
							},
							type: "image",
						},
						{ text: prompt, type: "text" },
					],
					role: "user",
				},
			],
		});
	}

	private buildNovaBody(
		image: Buffer,
		mediaType: string,
		prompt: string,
	): string {
		const [, format] = mediaType.split("/");

		return JSON.stringify({
			inferenceConfig: { maxTokens: MAX_TOKENS },
			messages: [
				{
					content: [
						{
							image: {
								format,
								source: { bytes: image.toString("base64") },
							},
						},
						{ text: prompt },
					],
					role: "user",
				},
			],
		});
	}

	/**
	 * Calls Anthropic directly rather than through Bedrock. Used while the
	 * Bedrock Marketplace subscription is unavailable; the key comes from SSM,
	 * never from the environment.
	 */
	private async transcribeDirect(
		{ image, mediaType, prompt }: TranscriptionRequest,
		modelId: string,
	): Promise<TranscriptionResponse> {
		const apiKey = await this.secrets.get(ANTHROPIC_KEY_PARAMETER);

		if (apiKey === null) {
			throw new Error(
				`Anthropic API key is not set. Put it in SSM as ${ANTHROPIC_KEY_PARAMETER}.`,
			);
		}

		const startedAt = Date.now();
		const response = await new Anthropic({ apiKey }).messages.create({
			max_tokens: MAX_TOKENS,
			messages: [
				{
					content: [
						{
							source: {
								data: image.toString("base64"),
								media_type: mediaType as "image/jpeg" | "image/png",
								type: "base64",
							},
							type: "image",
						},
						{ text: prompt, type: "text" },
					],
					role: "user",
				},
			],
			model: modelId,
		});

		return {
			latencyMs: Date.now() - startedAt,
			modelId,
			text: response.content
				.map((block) => (block.type === "text" ? block.text : ""))
				.join(""),
			usage: {
				inputTokens: response.usage.input_tokens,
				outputTokens: response.usage.output_tokens,
			},
		};
	}

	public async transcribe({
		image,
		mediaType,
		modelId,
		prompt,
	}: TranscriptionRequest): Promise<TranscriptionResponse> {
		const resolvedModelId = modelId ?? this.defaultModelId;

		if (resolvedModelId.startsWith(DIRECT_PREFIX)) {
			return await this.transcribeDirect(
				{ image, mediaType, modelId, prompt },
				resolvedModelId.slice(DIRECT_PREFIX.length),
			);
		}

		const isNova = isNovaModel(resolvedModelId);
		const startedAt = Date.now();

		const response = await this.client.send(
			new InvokeModelCommand({
				body: isNova
					? this.buildNovaBody(image, mediaType, prompt)
					: this.buildAnthropicBody(image, mediaType, prompt),
				contentType: "application/json",
				modelId: resolvedModelId,
			}),
		);

		const payload = JSON.parse(new TextDecoder().decode(response.body)) as
			| AnthropicPayload
			| NovaPayload;

		if (isNova) {
			const nova = payload as NovaPayload;

			return {
				latencyMs: Date.now() - startedAt,
				modelId: resolvedModelId,
				text: nova.output.message.content.map((block) => block.text).join(""),
				usage: {
					inputTokens: nova.usage.inputTokens,
					outputTokens: nova.usage.outputTokens,
				},
			};
		}

		const anthropic = payload as AnthropicPayload;

		return {
			latencyMs: Date.now() - startedAt,
			modelId: resolvedModelId,
			text: anthropic.content.map((block) => block.text).join(""),
			usage: {
				inputTokens: anthropic.usage.input_tokens,
				outputTokens: anthropic.usage.output_tokens,
			},
		};
	}
}

export { TranscriptionService };
