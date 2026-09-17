const TRANSCRIPTION_OUTPUT_RULES =
	"Return only raw JSON matching the provided schema. " +
	"Do not wrap the JSON in Markdown code fences. " +
	"Do not include explanations, commentary, or any text outside the JSON. " +
	"If no content matching the preset can be extracted, return an empty result that is still valid for the provided schema.";

export { TRANSCRIPTION_OUTPUT_RULES };
