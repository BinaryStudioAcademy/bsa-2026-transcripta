import { type Knex } from "knex";

const TABLE_NAME = "preset";

const DIARY_PRESET_DATA = {
	description:
		"Personal diaries, journals and letters, preserving entries, relatives' names, places and forms of address.",
	instructions: `This is a page from a handwritten diary, personal journal or letter.

Rules:
- Create one record per diary entry or letter in the order shown on the page. Keep an entry's continuation paragraphs together.
- Copy the full entry into entry_text, including greetings, signatures and personal remarks. Do not summarise, paraphrase or combine separate entries.
- Preserve the original language, spelling, punctuation and forms of address. Do not translate or modernise.
- Copy the date exactly as written. Do not infer a missing date from neighbouring entries or convert the calendar.
- Put each person's name as written in person_names, including relatives mentioned in the entry. Do not invent a name for someone identified only by a relationship such as mother or brother.
- Put each named location in places, retaining its historical spelling. Do not infer locations from context alone.
- Put greetings, salutations and closing forms of address in forms_of_address exactly as written.
- Preserve initials and personal abbreviations as written; do not guess which name they stand for.
- Use the seed glossary only as a reading aid, never to add people, places or phrases absent from the entry.
- Return an absent scalar value as null, not an empty string. Return an empty array when an entry contains no names, places or forms of address of the corresponding kind.
- Return an empty records array when the page contains no diary entries or letters.`,
	is_public: true,
	name: "Diary",
	output_schema: JSON.stringify({
		properties: {
			page_text: {
				description:
					"The whole page as continuous readable text, exactly as written on the scan.",
				type: "string",
			},
			records: {
				items: {
					properties: {
						date: { type: ["string", "null"] },
						entry_text: { type: ["string", "null"] },
						forms_of_address: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "formula",
						},
						person_names: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "person_name",
						},
						places: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "place",
						},
					},
					type: "object",
				},
				type: "array",
			},
		},
		required: ["records", "page_text"],
		type: "object",
	}),
	owner_id: null,
	seed_glossary: JSON.stringify([
		{ kind: "term", note: "family relationship", value: "mother" },
		{ kind: "term", note: "family relationship", value: "father" },
		{ kind: "term", note: "family relationship", value: "sister" },
		{ kind: "formula", note: "salutation to a relative", value: "Dear Mother" },
		{
			kind: "formula",
			note: "salutation to a relative",
			value: "My dear sister",
		},
		{ kind: "formula", note: "letter closing", value: "Yours affectionately" },
		{ kind: "abbreviation", note: "form of address", value: "Mr." },
		{ kind: "abbreviation", note: "form of address", value: "Mrs." },
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
	version: 1,
};

async function down(knex: Knex): Promise<void> {
	await knex(TABLE_NAME)
		.where({
			is_public: DIARY_PRESET_DATA.is_public,
			name: DIARY_PRESET_DATA.name,
			version: DIARY_PRESET_DATA.version,
		})
		.whereNull("owner_id")
		.delete();
}

async function up(knex: Knex): Promise<void> {
	await knex(TABLE_NAME).insert(DIARY_PRESET_DATA);
}

export { down, up };
