import { EMPTY_LENGTH, JSON_INDENTATION } from "../constants/constants.js";

const buildRederiveStructuredPrompt = (
	text: string,
	outputSchema: Record<string, unknown>,
	structured: null | Record<string, unknown> = null,
): string => {
	const hasPreviousData =
		structured !== null && Object.keys(structured).length > EMPTY_LENGTH;

	const previousDataSection = hasPreviousData
		? `\n### PREVIOUS STRUCTURED DATA (Outdated):
${JSON.stringify(structured, null, JSON_INDENTATION)}
`
		: "";

	const mergeInstructions = hasPreviousData
		? `3. **State Reconciliation & Delta Update:**
- Compare the UPDATED SOURCE TEXT against the PREVIOUS STRUCTURED DATA.
- **Preserve:** Keep existing values/fields from PREVIOUS STRUCTURED DATA if they are still accurate and consistent with the UPDATED SOURCE TEXT.
- **Update:** Modify field values if the user's corrections in the UPDATED SOURCE TEXT contradict or refine the previous data.
- **Remove:** Set fields to \`null\` (or omit if optional per schema) if the corresponding information was removed or explicitly invalidated in the UPDATED SOURCE TEXT.
- **Add:** Extract and populate new fields defined in the JSON SCHEMA if new relevant information was added in the UPDATED SOURCE TEXT.`
		: `3. **Extraction Strategy:**
- Extract all relevant entities and facts from the UPDATED SOURCE TEXT to build the JSON object from scratch according to the JSON SCHEMA.`;

	const prompt = `You are a high-precision Data Reconciliation & Information Extraction Agent. Your task is to produce an updated, highly accurate JSON object that fully complies with the provided JSON SCHEMA based on the UPDATED SOURCE TEXT${hasPreviousData ? " and PREVIOUS STRUCTURED DATA" : ""}.

### INSTRUCTIONS:
1. **Schema Compliance:**
- The resulting JSON object MUST strictly adhere to the structure, property names, nested objects, array shapes, and data types defined in the JSON SCHEMA.
- Populate all fields for which information exists in the text.
- If information for a required schema field is missing or erased, set its value to \`null\` (or omit if optional).

2. **Truth Source:**
- The UPDATED SOURCE TEXT is the primary ground truth. Always prioritize facts and corrections present in the text over outdated previous data.

${mergeInstructions}

4. **Strict Output Rules:**
- Return ONLY a single, valid raw JSON object.
- Do NOT wrap the output in Markdown blocks (do NOT use \`\`\`json or \`\`\`).
- Do NOT include any intro, preambles, explanations, or post-notes.${previousDataSection}
### JSON SCHEMA:
${JSON.stringify(outputSchema, null, JSON_INDENTATION)}

### UPDATED SOURCE TEXT:
${text}`;

	return prompt;
};

export { buildRederiveStructuredPrompt };
