import type { Knex } from "knex";

const TABLE_NAME = "transcription_cache";

const TRIGGER_NAME = "cache_touch";
const TOUCH_UPDATED_AT_FUNCTION_NAME = "touch_updated_at";

const DEFAULT_INPUT_TOKEN = 0;
const DEFAULT_OUTPUT_TOKEN = 0;
const DEFAULT_COST_USD = 0;
const COST_USD_PRECISION = 12;
const COST_USD_SCALE = 6;
const DEFAULT_HIT_COUNT = 0;

const ColumnName = {
	CACHE_KEY: "cache_key",
	COST_USD: "cost_usd",
	CREATED_AT: "created_at",
	HIT_COUNT: "hit_count",
	INPUT_TOKENS: "input_tokens",
	LAST_HIT_AT: "last_hit_at",
	OUTPUT_TOKENS: "output_tokens",
	STRUCTURED: "structured",
	TEXT: "text",
	UPDATED_AT: "updated_at",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.raw(`DROP TRIGGER IF EXISTS ${TRIGGER_NAME} ON ${TABLE_NAME}`);

	await knex.schema.dropTableIfExists(TABLE_NAME);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.text(ColumnName.CACHE_KEY).primary();
		table.text(ColumnName.TEXT).notNullable();
		table.jsonb(ColumnName.STRUCTURED).nullable();
		table
			.integer(ColumnName.INPUT_TOKENS)
			.notNullable()
			.defaultTo(DEFAULT_INPUT_TOKEN);
		table
			.integer(ColumnName.OUTPUT_TOKENS)
			.notNullable()
			.defaultTo(DEFAULT_OUTPUT_TOKEN);
		table
			.decimal(ColumnName.COST_USD, COST_USD_PRECISION, COST_USD_SCALE)
			.notNullable()
			.defaultTo(DEFAULT_COST_USD);
		table
			.integer(ColumnName.HIT_COUNT)
			.notNullable()
			.defaultTo(DEFAULT_HIT_COUNT);
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table.timestamp(ColumnName.LAST_HIT_AT, { useTz: true }).nullable();
	});

	await knex.raw(`
	CREATE TRIGGER ${TRIGGER_NAME}
	BEFORE UPDATE ON ${TABLE_NAME}
	FOR EACH ROW
	EXECUTE FUNCTION ${TOUCH_UPDATED_AT_FUNCTION_NAME}()`);
}

export { down, up };
