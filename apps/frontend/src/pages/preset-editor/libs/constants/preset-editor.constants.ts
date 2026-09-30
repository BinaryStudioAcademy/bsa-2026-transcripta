import { LexiconEntryKind } from "@transcripta/shared";

import { type GlossaryType } from "../types/preset-editor.types.js";

const GLOSSARY_TYPES: GlossaryType[] = [
	LexiconEntryKind.PERSON_NAME,
	LexiconEntryKind.SURNAME,
	LexiconEntryKind.PLACE,
	LexiconEntryKind.TERM,
	LexiconEntryKind.FORMULA,
	LexiconEntryKind.ABBREVIATION,
	LexiconEntryKind.OTHER,
];

export { GLOSSARY_TYPES };
