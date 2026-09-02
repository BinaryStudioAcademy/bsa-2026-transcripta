import { HTTPMethod } from "@transcripta/shared";
import { useCallback, useState } from "react";

import { Loader } from "~/libs/components/components.js";
import { LoaderSize } from "~/libs/enums/enums.js";
import { config } from "~/libs/modules/config/config.js";

import { calculateCer } from "./libs/cer.js";

const FIRST_FILE_INDEX = 0;
const FIRST_MODEL_INDEX = 0;
const CER_PRECISION = 1;

const MODEL_OPTIONS = [
	{
		isDisabled: false,
		label: "Amazon Nova Pro (Bedrock)",
		value: "us.amazon.nova-pro-v1:0",
	},
	{
		isDisabled: false,
		label: "Amazon Nova Lite (Bedrock)",
		value: "us.amazon.nova-lite-v1:0",
	},
	{
		isDisabled: false,
		label: "Claude Sonnet 4.6 (Bedrock)",
		value: "us.anthropic.claude-sonnet-4-6",
	},
	{
		isDisabled: false,
		label: "Claude Sonnet 4.5 (Bedrock)",
		value: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
	},
	{
		isDisabled: false,
		label: "Claude Sonnet 4.6 (direct API)",
		value: "anthropic-direct:claude-sonnet-4-6",
	},
];

const DEFAULT_PROMPT =
	"Transcribe the handwritten text on this page exactly as written. " +
	"Preserve the original spelling, capitalisation and line breaks. " +
	"Return only the transcription, with no commentary.";

const PERCENT = 100;

type Result = {
	latencyMs: number;
	modelId: string;
	text: string;
	usage: { inputTokens: number; outputTokens: number };
};

const Test: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
	const [reference, setReference] = useState("");
	const [modelId, setModelId] = useState(
		MODEL_OPTIONS[FIRST_MODEL_INDEX]?.value ?? "",
	);
	const [result, setResult] = useState<null | Result>(null);
	const [error, setError] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setFile(event.target.files?.[FIRST_FILE_INDEX] ?? null);
		},
		[],
	);

	const handlePromptChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPrompt(event.target.value);
		},
		[],
	);

	const handleReferenceChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			setReference(event.target.value);
		},
		[],
	);

	const handleModelChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			setModelId(event.target.value);
		},
		[],
	);

	const handleSubmit = useCallback(
		(event: React.FormEvent) => {
			event.preventDefault();

			if (!file) {
				return;
			}

			const send = async (): Promise<void> => {
				setIsLoading(true);
				setError(null);
				setResult(null);

				const payload = new FormData();

				payload.append("image", file);
				payload.append("mediaType", file.type);
				payload.append("modelId", modelId);
				payload.append("prompt", prompt);

				try {
					// ORIGIN_URL already carries the /api/v1 prefix.
					const response = await fetch(
						`${config.ENV.API.ORIGIN_URL}/test/transcribe`,
						{ body: payload, method: HTTPMethod.POST },
					);

					if (!response.ok) {
						const details = (await response.json()) as { message?: string };

						throw new Error(details.message ?? response.statusText);
					}

					setResult((await response.json()) as Result);
				} catch (requestError) {
					setError((requestError as Error).message);
				} finally {
					setIsLoading(false);
				}
			};

			void send();
		},
		[file, modelId, prompt],
	);

	const cer = result ? calculateCer(reference, result.text) : null;

	return (
		<div className="test-page">
			<h1>Transcription sandbox</h1>
			<p className="test-page__hint">
				Internal calibration tool. Nothing is stored — a refresh clears
				everything.
			</p>

			<form className="test-page__form" onSubmit={handleSubmit}>
				<label>
					Model
					<select onChange={handleModelChange} value={modelId}>
						{MODEL_OPTIONS.map((option) => (
							<option
								disabled={option.isDisabled}
								key={option.value}
								value={option.value}
							>
								{option.label}
							</option>
						))}
					</select>
				</label>

				<label>
					Scan
					<input accept="image/*" onChange={handleFileChange} type="file" />
				</label>

				<label>
					Prompt
					<textarea onChange={handlePromptChange} rows={5} value={prompt} />
				</label>

				<label>
					Reference text (optional — needed to score the run)
					<textarea
						onChange={handleReferenceChange}
						rows={5}
						value={reference}
					/>
				</label>

				<button disabled={!file || isLoading} type="submit">
					{isLoading && <Loader size={LoaderSize.SMALL} />}
					{isLoading ? "Transcribing…" : "Transcribe"}
				</button>
			</form>

			{error && <p className="test-page__error">{error}</p>}

			{result && (
				<section className="test-page__result">
					<dl className="test-page__stats">
						<div>
							<dt>CER</dt>
							<dd>
								{cer === null
									? "no reference"
									: `${(cer * PERCENT).toFixed(CER_PRECISION)}%`}
							</dd>
						</div>
						<div>
							<dt>Input tokens</dt>
							<dd>{result.usage.inputTokens}</dd>
						</div>
						<div>
							<dt>Output tokens</dt>
							<dd>{result.usage.outputTokens}</dd>
						</div>
						<div>
							<dt>Latency</dt>
							<dd>{result.latencyMs} ms</dd>
						</div>
					</dl>

					<pre className="test-page__text">{result.text}</pre>
				</section>
			)}
		</div>
	);
};

export { Test };
