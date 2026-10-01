import { type SeedGlossary } from "~/modules/context/libs/types/types.js";

import { SeedGlossaryFields } from "../enums/enums.js";
import { type SeedGlossaryEntry } from "../types/types.js";
import { isValueOnlyGlossary } from "./is-value-only-glossary.helper.js";

const toKeyPart = (value: unknown): string =>
	(typeof value === "string" ? value : "")
		.trim()
		.toLowerCase()
		.normalize("NFC");

const dedupeValues = (values: string[]): string[] => {
	const seen = new Set<string>();

	return values.filter((value) => {
		const key = toKeyPart(value);

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);

		return true;
	});
};

const dedupeEntries = (entries: SeedGlossaryEntry[]): SeedGlossaryEntry[] => {
	const byKey = new Map<string, SeedGlossaryEntry>();

	for (const entry of entries) {
		const key = `${toKeyPart(entry[SeedGlossaryFields.KIND])}\u0000${toKeyPart(entry[SeedGlossaryFields.VALUE])}`;
		const kept = byKey.get(key);

		if (!kept) {
			byKey.set(key, entry);
			continue;
		}

		if (
			!toKeyPart(kept[SeedGlossaryFields.NOTE]) &&
			toKeyPart(entry[SeedGlossaryFields.NOTE])
		) {
			byKey.set(key, {
				...kept,
				[SeedGlossaryFields.NOTE]: entry[SeedGlossaryFields.NOTE],
			});
		}
	}

	return [...byKey.values()];
};

const dedupeSeedGlossary = (seedGlossary: SeedGlossary): SeedGlossary =>
	isValueOnlyGlossary(seedGlossary)
		? dedupeValues(seedGlossary)
		: dedupeEntries(seedGlossary);

export { dedupeSeedGlossary };
