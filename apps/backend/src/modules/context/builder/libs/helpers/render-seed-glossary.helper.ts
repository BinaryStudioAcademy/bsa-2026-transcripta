import { type SeedGlossary } from "~/modules/context/libs/types/types.js";

import { EMPTY_LENGTH } from "../constants/constants.js";
import { LeadInPhrase } from "../enums/enums.js";
import { isStringArray, renderSeedGlossaryEntry } from "./helpers.js";

const renderSeedGlossary = (seedGlossary: SeedGlossary): string => {
	if (seedGlossary.length === EMPTY_LENGTH) {
		return "";
	}

	if (isStringArray(seedGlossary)) {
		return `${LeadInPhrase.SEED_GLOSSARY}:\n${seedGlossary.join(", ")}`;
	}

	return `${LeadInPhrase.SEED_GLOSSARY}:\n${seedGlossary.map((entry) => renderSeedGlossaryEntry(entry)).join("\n")}`;
};

export { renderSeedGlossary };
