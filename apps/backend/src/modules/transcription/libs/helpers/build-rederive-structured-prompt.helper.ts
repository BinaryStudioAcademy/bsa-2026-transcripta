import { JSON_INDENTATION } from "../constants/constants.js";

const buildRederiveStructuredPrompt = (
	text: string,
	outputSchema: Record<string, unknown>,
): string => {
	const prompt = `You are a precise Information Extraction System. Your task is to extract specified entities from the provided SOURCE TEXT based on the given JSON SCHEMA.

### CRITICAL REQUIREMENT:
Extract ONLY the fields that contain an "x-entity-kind" property in their schema definition. Fully IGNORE all other fields present in the schema (do NOT populate or include fields without "x-entity-kind").

### INSTRUCTIONS:
1. **Target Fields Only:** Locate and extract values ONLY for properties annotated with "x-entity-kind" (e.g., person names, surnames, places, dates).
2. **Schema & Type Adherence:**
- The output MUST strictly follow the JSON structure and types defined for the target fields.
- If a target field is not found in the text, set its value to \`null\` (or omit if optional).
- Respect data types strictly (e.g., strings as quoted text, numbers as numeric values).
3. **Output Format:**
- Return ONLY a single, valid JSON object.
- Do NOT wrap the JSON in Markdown code blocks (do NOT use \`\`\`json ... \`\`\`).
- Do NOT include any explanations, preamble, or notes.

### JSON SCHEMA:
${JSON.stringify(outputSchema, null, JSON_INDENTATION)}

### SOURCE TEXT:
${text}`;

	return prompt;
};

export { buildRederiveStructuredPrompt };
