import { type Knex } from "knex";

const TABLE_NAME = "preset";

const DEFAULT_PRESET = {
	description:
		"Parish records of births, marriages and deaths. Cursive, faded ink.",
	family_id: 1,
	id: 1,
	instructions: `This is a page from a late 19th-century Orthodox parish register.
The text is written in cursive and the ink has faded in places.

Rules:
- Preserve the original spelling, including archaic letters. Do not modernise.
- Expand abbreviations in square brackets: "archpr." -> "archpr.[iest]".
- Mark the illegible as [?] and the completely lost as [...].
- Keep dates exactly as written, do not convert the calendar.
- Return an empty cell as null, not as an empty string.`,
	is_public: false,
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
	owner_id: 1,
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
		maxContextTokens: 6000,
		maxImageWidth: 2048,
		maxOutputTokens: 4096,
		minDistinctPages: 2,
		model: "claude-opus-5",
		neighbourPages: 3,
		provider: "anthropic",
		temperature: 0,
		windowSize: 5,
	}),
	version: 1,
};

async function down(knex: Knex): Promise<void> {
	await knex("preset").where({ id: 1 }).delete();
}

async function up(knex: Knex): Promise<void> {
	await knex("users")
		.insert({
			email: "demo@example.org",
			id: 1,
			password_hash: "seed-placeholder-hash",
			password_salt: "seed-placeholder-salt",
		})
		.onConflict("email")
		.ignore();

	await knex.raw(`
		SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM users));
	`);

	await knex(TABLE_NAME)
		.insert(DEFAULT_PRESET)
		.onConflict(["family_id", "version"])
		.ignore();

	await knex.raw(`
		SELECT setval(pg_get_serial_sequence('${TABLE_NAME}', 'id'), (SELECT max(id) FROM ${TABLE_NAME}));
		SELECT setval('preset_family_seq', (SELECT max(family_id) FROM ${TABLE_NAME}));
	`);
}

export { down, up };
