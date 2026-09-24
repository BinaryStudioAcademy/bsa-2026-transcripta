import { GlossaryEntry } from "../types/preset-editor.types.js";
import { isGlossaryType } from "./is-glossary-type.helper.js";

const mapSeedGlossary = (
	seedGlossary: Record<string, unknown>[] | string[],
): GlossaryEntry[] =>
	seedGlossary.map((entry) => {
		if (typeof entry === "string") {
			return {
				id: crypto.randomUUID(),
				kind: "term",
				value: entry,
			};
		}

		const kind = entry["kind"];
		const value = entry["value"];

		return {
			id: crypto.randomUUID(),
			kind: isGlossaryType(kind) ? kind : "term",
			value: typeof value === "string" ? value : "",
		};
	});

export { mapSeedGlossary };
