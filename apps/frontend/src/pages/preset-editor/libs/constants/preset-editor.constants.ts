import type { BasePreset, GlossaryType } from "../types/preset-editor.types.js";

const GLOSSARY_TYPES: GlossaryType[] = [
	"person name",
	"surname",
	"place",
	"term",
	"formula",
	"abbreviation",
	"other",
];

const BASE_PRESETS: BasePreset[] = [
	{
		description: "Historical parish register documents",
		id: "parish-register",
		name: "Parish register",
	},
	{
		description: "Historical medical records",
		id: "medical-record",
		name: "Medical record",
	},
	{
		description: "Personal diary documents",
		id: "diary",
		name: "Diary",
	},
	{
		description: "Historical ledger documents",
		id: "ledger",
		name: "Ledger",
	},
];

/**
 * Temporary preview data.
 * Replace with output fields from the selected preset
 * when the full preset API is available.
 */
const OUTPUT_FIELDS = [
	"record_no",
	"date",
	"given_name",
	"surname",
	"place",
	"notes",
];

const INITIAL_ENTRIES = [
	{ kind: "surname", value: "Ivanenko" },
	{ kind: "place", value: "Dykanka" },
	{ kind: "formula", value: "born and baptised" },
	{ kind: "abbreviation", value: "peas. = peasant" },
] as const;

export { BASE_PRESETS, GLOSSARY_TYPES, INITIAL_ENTRIES, OUTPUT_FIELDS };
