import { SeedGlossaryFields } from "../enums/enums.js";
import { type SeedGlossaryEntry } from "../types/types.js";

const renderSeedGlossaryEntry = (entry: SeedGlossaryEntry): string => {
	const kind = entry[SeedGlossaryFields.KIND] as string;
	const value = entry[SeedGlossaryFields.VALUE] as string;
	const note = entry[SeedGlossaryFields.NOTE] as string;
	let result = "";

	if (kind) {
		result += `[${kind}]`;
	}

	if (value) {
		result += ` "${value}"`;
	}

	if (note) {
		result += ` (Note: ${note})`;
	}

	return result;
};

export { renderSeedGlossaryEntry };
