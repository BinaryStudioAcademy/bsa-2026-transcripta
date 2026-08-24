import {
	BedrockRuntimeClient,
	InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import { type Config } from "~/libs/modules/config/config.js";

import {
	type TranscriptionRequest,
	type TranscriptionResponse,
} from "./libs/types/types.js";

const ANTHROPIC_VERSION = "bedrock-2023-05-31";
const MAX_TOKENS = 8192;

type BedrockResponse = {
	content: { text: string }[];
	usage: { input_tokens: number; output_tokens: number };
};

class TranscriptionService {
	private client: BedrockRuntimeClient;

	private defaultModelId: string;

	public constructor(config: Config) {
		this.client = new BedrockRuntimeClient({
			region: config.ENV.BEDROCK.REGION,
		});
		this.defaultModelId = config.ENV.BEDROCK.MODEL_ID;
	}

	public async transcribe({
		image,
		mediaType,
		modelId,
		prompt,
	}: TranscriptionRequest): Promise<TranscriptionResponse> {
		const resolvedModelId = modelId ?? this.defaultModelId;
		const startedAt = Date.now();

		const response = await this.client.send(
			new InvokeModelCommand({
				body: JSON.stringify({
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
				}),
				contentType: "application/json",
				modelId: resolvedModelId,
			}),
		);

		const payload = JSON.parse(
			new TextDecoder().decode(response.body),
		) as BedrockResponse;

		return {
			latencyMs: Date.now() - startedAt,
			modelId: resolvedModelId,
			text: payload.content.map((block) => block.text).join(""),
			usage: {
				inputTokens: payload.usage.input_tokens,
				outputTokens: payload.usage.output_tokens,
			},
		};
	}
}

export { TranscriptionService };
