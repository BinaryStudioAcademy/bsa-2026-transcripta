import { createHash } from "node:crypto";

const stableStringify = (object: unknown): string => {
	if (object === null || typeof object !== "object") {
		return JSON.stringify(object);
	}
	if (Array.isArray(object)) {
		return `[${object.map((item) => stableStringify(item)).join(",")}]`;
	}
	const sortedKeys = Object.keys(object as Record<string, unknown>).sort(
		(a, b) => a.localeCompare(b),
	);
	const entries = sortedKeys.map(
		(key) =>
			`${JSON.stringify(key)}:${stableStringify((object as Record<string, unknown>)[key])}`,
	);
	return `{${entries.join(",")}}`;
};

const generateRederiveStructuredCacheKey = ({
	modelId,
	outputSchema,
	structured,
	text,
}: {
	modelId: string;
	outputSchema: Record<string, unknown>;
	structured: null | Record<string, unknown>;
	text: string;
}): string => {
	const serializedSchema = stableStringify(outputSchema);
	const serializedStructured = structured
		? stableStringify(structured)
		: "null";

	const rawPayload = [
		modelId,
		serializedSchema,
		text,
		serializedStructured,
	].join("\0");

	return createHash("sha256").update(rawPayload).digest("hex");
};

export { generateRederiveStructuredCacheKey };
