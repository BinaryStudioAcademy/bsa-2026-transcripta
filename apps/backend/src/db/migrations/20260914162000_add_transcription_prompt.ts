import { type Knex } from "knex";

const TABLE_NAME = "transcription";
const ColumnName = {
	PROMPT: "prompt",
} as const;

const EMPTY_PROMPT = "";

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropColumn(ColumnName.PROMPT);
	});
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.text(ColumnName.PROMPT).notNullable().defaultTo(EMPTY_PROMPT);
	});

	await knex.raw(`
		COMMENT ON COLUMN ${TABLE_NAME}.${ColumnName.PROMPT} IS
		'User prompt that produced raw_response (buildUserPrompt, plus repair suffix when the final model call was a repair).'
	`);
}

export { down, up };
