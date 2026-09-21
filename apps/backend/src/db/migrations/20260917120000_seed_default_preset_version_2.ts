import { type Knex } from "knex";

const TABLE_NAME = "preset";

const DEFAULT_PRESET_DATA = {
	description:
		"Parish records of births, marriages and deaths. Cursive, faded ink.",
	family_id: 1,
	instructions: `This is a page from a late 19th-century Orthodox parish register.
The text is written in cursive and the ink has faded in places.

Rules:
- Preserve the original spelling, including archaic letters. Do not modernise.
- Expand abbreviations in square brackets: "archpr." -> "archpr.[iest]".
- Mark the illegible as [?] and the completely lost as [...].
- Keep dates exactly as written, do not convert the calendar.
- Return an empty cell as null, not as an empty string.`,
	is_public: true,
	name: "Parish register, late 19th century",
	output_schema: JSON.stringify({
		properties: {
			records: {
				items: {
					properties: {
						date_text: { type: ["string", "null"] },
						event_type: {
							enum: ["birth", "marriage", "death", "unknown"],
							type: "string",
						},
						given_name: {
							type: ["string", "null"],
							"x-entity-kind": "person_name",
						},
						notes: { type: ["string", "null"] },
						place: {
							type: ["string", "null"],
							"x-entity-kind": "place",
						},
						record_no: { type: ["integer", "null"] },
						surname: {
							type: ["string", "null"],
							"x-entity-kind": "surname",
						},
						uncertain: { default: false, type: "boolean" },
					},
					type: "object",
				},
				type: "array",
			},
		},
		required: ["records"],
		type: "object",
	}),
	owner_id: null,
	seed_glossary: JSON.stringify([
		{ kind: "formula", note: "birth record", value: "born and baptised" },
		{ kind: "formula", note: "", value: "in lawful wedlock" },
		{ kind: "formula", note: "", value: "died of old age" },
		{
			kind: "formula",
			note: "baptism record",
			value: "the godparents were",
		},
		{ kind: "abbreviation", note: "archpriest", value: "archpr." },
		{ kind: "abbreviation", note: "peasant", value: "peas." },
		{ kind: "term", note: "", value: "godparent" },
		{ kind: "place", note: "", value: "Poltava Governorate" },
	]),
	settings: JSON.stringify({
		dpi: 400,
		grayscale: true,
		lexiconTopK: 100,
		maxContextTokens: 6000,
		maxImageWidth: 2048,
		maxOutputTokens: 4096,
		minDistinctPages: 2,
		model: "us.anthropic.claude-sonnet-4-6",
		neighbourPages: 3,
		provider: "anthropic",
		temperature: 0,
		windowSize: 5,
	}),
	version: 2,
};

async function down(knex: Knex): Promise<void> {
	await knex(TABLE_NAME)
		.where({
			family_id: DEFAULT_PRESET_DATA.family_id,
			version: DEFAULT_PRESET_DATA.version,
		})
		.delete();
}

async function up(knex: Knex): Promise<void> {
	await knex(TABLE_NAME).insert(DEFAULT_PRESET_DATA);
}

export { down, up };
