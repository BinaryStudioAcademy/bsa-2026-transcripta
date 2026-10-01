import { type Knex } from "knex";

const TABLE_NAME = "preset";

const MEDICAL_RECORD_PRESET_DATA = {
	description:
		"Patient registers, clinical case notes and prescriptions, with diagnoses, drug names and doctors' abbreviations.",
	instructions: `This is a page from a handwritten medical record, patient register or prescription.

Rules:
- Create one record per patient entry, consultation or prescription, in the order shown on the page. Keep continuation lines with their entry.
- Preserve the original language, spelling and medical terminology. Do not translate or modernise.
- Copy record numbers, dates and ages exactly as written, including prefixes, units and calendar notation.
- Copy only the diagnosis stated in the entry. Do not infer a diagnosis from symptoms, treatment or the seed glossary.
- Put each drug name actually written in the entry in drug_names. Keep doses, units, routes and treatment directions exactly as written in notes; never calculate or supply missing doses.
- Put the doctor's abbreviations in abbreviations exactly as written. Do not guess their expansions.
- Keep symptoms, observations, treatment, admission or discharge details and marginal notes in notes, without summarising or combining different patients' information.
- Use the seed glossary only as a reading aid, never as evidence that a name, diagnosis or drug appears on the page.
- Return an absent scalar value or empty cell as null, not an empty string. Return an empty array when no drug names or abbreviations are present.
- Return an empty records array when the page contains no medical entries.`,
	is_public: true,
	name: "Medical record",
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
						abbreviations: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "abbreviation",
						},
						age: { type: ["string", "null"] },
						date: { type: ["string", "null"] },
						diagnosis: {
							type: ["string", "null"],
							"x-entity-kind": "term",
						},
						drug_names: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "term",
						},
						notes: { type: ["string", "null"] },
						patient_name: {
							type: ["string", "null"],
							"x-entity-kind": "person_name",
						},
						record_no: { type: ["string", "null"] },
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
		{ kind: "term", note: "diagnosis", value: "pneumonia" },
		{ kind: "term", note: "diagnosis", value: "bronchitis" },
		{ kind: "term", note: "drug name", value: "quinine" },
		{ kind: "term", note: "drug name", value: "morphine" },
		{ kind: "abbreviation", note: "prescription heading", value: "Rx." },
		{ kind: "abbreviation", note: "doctor's title", value: "Dr." },
		{
			kind: "formula",
			note: "patient register heading",
			value: "date of admission",
		},
		{
			kind: "formula",
			note: "patient register heading",
			value: "date of discharge",
		},
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
			is_public: MEDICAL_RECORD_PRESET_DATA.is_public,
			name: MEDICAL_RECORD_PRESET_DATA.name,
			version: MEDICAL_RECORD_PRESET_DATA.version,
		})
		.whereNull("owner_id")
		.delete();
}

async function up(knex: Knex): Promise<void> {
	await knex(TABLE_NAME).insert(MEDICAL_RECORD_PRESET_DATA);
}

export { down, up };
