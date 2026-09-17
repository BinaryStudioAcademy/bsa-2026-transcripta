import { type Knex } from "knex";

const TABLE_NAME = "transcription";
const ColumnName = {
	RAW_RESPONSE: "raw_response",
} as const;

const EMPTY_RAW_RESPONSE = "";

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropColumn(ColumnName.RAW_RESPONSE);
	});
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table
			.text(ColumnName.RAW_RESPONSE)
			.notNullable()
			.defaultTo(EMPTY_RAW_RESPONSE);
	});

	await knex.raw(`
		COMMENT ON COLUMN ${TABLE_NAME}.${ColumnName.RAW_RESPONSE} IS
		'Raw model text before schema validation (and before code-fence strip). Empty for cache hits and pre-feature rows.'
	`);
}

export { down, up };
