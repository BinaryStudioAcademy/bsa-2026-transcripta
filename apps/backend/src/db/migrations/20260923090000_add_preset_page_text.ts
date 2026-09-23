import { type Knex } from "knex";

const TABLE_NAME = "preset";
const TRIGGER_NAME = "preset_immutable";

const PAGE_TEXT_KEY = "page_text";

const PAGE_TEXT_PROPERTY = {
	description:
		"The whole page as continuous readable text, exactly as written on the scan.",
	type: "string",
};

const PAGE_TEXT_RULE =
	"- Put the whole page as continuous readable text in the page_text field, keeping the original line order. The structured records describe the same page, they do not replace it.";

const addPageText = async (knex: Knex): Promise<void> => {
	await knex.raw(`ALTER TABLE ${TABLE_NAME} DISABLE TRIGGER ${TRIGGER_NAME}`);

	try {
		await knex(TABLE_NAME)
			.whereRaw("output_schema -> 'properties' ->> ? is null", [PAGE_TEXT_KEY])
			.update({
				instructions: knex.raw("instructions || ?", [`\n${PAGE_TEXT_RULE}`]),
				outputSchema: knex.raw(
					`jsonb_set(
						jsonb_set(output_schema, '{properties,${PAGE_TEXT_KEY}}', ?::jsonb),
						'{required}',
						coalesce(output_schema -> 'required', '[]'::jsonb) || ?::jsonb
					)`,
					[JSON.stringify(PAGE_TEXT_PROPERTY), JSON.stringify([PAGE_TEXT_KEY])],
				),
			});
	} finally {
		await knex.raw(`ALTER TABLE ${TABLE_NAME} ENABLE TRIGGER ${TRIGGER_NAME}`);
	}
};

const removePageText = async (knex: Knex): Promise<void> => {
	await knex.raw(`ALTER TABLE ${TABLE_NAME} DISABLE TRIGGER ${TRIGGER_NAME}`);

	try {
		await knex(TABLE_NAME).update({
			instructions: knex.raw("replace(instructions, ?, '')", [
				`\n${PAGE_TEXT_RULE}`,
			]),
			outputSchema: knex.raw(
				`jsonb_set(
					output_schema #- '{properties,${PAGE_TEXT_KEY}}',
					'{required}',
					coalesce(output_schema -> 'required', '[]'::jsonb) - ?
				)`,
				[PAGE_TEXT_KEY],
			),
		});
	} finally {
		await knex.raw(`ALTER TABLE ${TABLE_NAME} ENABLE TRIGGER ${TRIGGER_NAME}`);
	}
};

async function down(knex: Knex): Promise<void> {
	await removePageText(knex);
}

async function up(knex: Knex): Promise<void> {
	await addPageText(knex);
}

export { down, up };
