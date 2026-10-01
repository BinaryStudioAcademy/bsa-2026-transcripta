import { type Knex } from "knex";

const TABLE_NAME = "preset";

const LEDGER_PRESET_DATA = {
	description:
		"Account books and transaction ledgers, with original amounts, balances, company names, legal formulas and units.",
	instructions: `This is a page from a handwritten ledger or account book.

Rules:
- Create one record per transaction or account row, in the order shown on the page. Keep continuation lines with the transaction they belong to.
- Preserve the original language, spelling and bookkeeping terminology. Do not translate or modernise.
- Copy entry_no and date exactly as written, including marginal entry numbers and historical date notation.
- Copy the full transaction description into description, preserving company names, contractual wording and quantities.
- Copy amount and balance as strings exactly as written, including currency signs, debit or credit labels, separators, fractions and historical monetary units. Never convert currencies, recompute totals or fill a missing balance.
- Keep debit, credit and balance values associated with their own row. If a row has both debit and credit amounts, preserve both with their source labels in amount; do not net them into a single number.
- Put explicitly named companies or businesses in company_names. Do not treat column headings or account totals as company names.
- Put recurring legal or contractual phrases in legal_formulas and each written unit of measurement in units, retaining their original wording and abbreviations.
- Preserve commercial abbreviations as written. Do not guess a company's full name or expand an ambiguous unit.
- Use the seed glossary only as a reading aid, never to supply absent companies, formulas, units or amounts.
- Return an absent scalar value or empty cell as null, not an empty string. Return an empty array when a row contains no companies, legal formulas or units of the corresponding kind.
- Return an empty records array when the page contains no ledger entries.`,
	is_public: true,
	name: "Ledger",
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
						amount: { type: ["string", "null"] },
						balance: { type: ["string", "null"] },
						company_names: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "other",
						},
						date: { type: ["string", "null"] },
						description: { type: ["string", "null"] },
						entry_no: { type: ["string", "null"] },
						legal_formulas: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "formula",
						},
						units: {
							items: { type: "string" },
							type: "array",
							"x-entity-kind": "term",
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
		{ kind: "abbreviation", note: "company name suffix", value: "Co." },
		{ kind: "abbreviation", note: "company name suffix", value: "Ltd." },
		{ kind: "formula", note: "contractual phrase", value: "value received" },
		{ kind: "formula", note: "payment or account phrase", value: "on account" },
		{
			kind: "formula",
			note: "balance carried from an earlier page",
			value: "balance brought forward",
		},
		{ kind: "term", note: "weight unit abbreviation", value: "lb." },
		{ kind: "term", note: "quantity unit", value: "dozen" },
		{ kind: "term", note: "length unit", value: "yards" },
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
			is_public: LEDGER_PRESET_DATA.is_public,
			name: LEDGER_PRESET_DATA.name,
			version: LEDGER_PRESET_DATA.version,
		})
		.whereNull("owner_id")
		.delete();
}

async function up(knex: Knex): Promise<void> {
	await knex(TABLE_NAME).insert(LEDGER_PRESET_DATA);
}

export { down, up };
