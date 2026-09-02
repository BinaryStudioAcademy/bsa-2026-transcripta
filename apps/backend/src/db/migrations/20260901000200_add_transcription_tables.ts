import { type Knex } from "knex";

const TABLE_NAME = "transcription";
const PAGE_TABLE_NAME = "page";
const DOCUMENT_TABLE_NAME = "document";

const FUNCTION_NAME = "touch_updated_at";
const TRIGGER_NAME = "transcription_touch";

const DEFAULT_INPUT_TOKEN = 0;
const DEFAULT_OUTPUT_TOKEN = 0;
const DEFAULT_COST_USD = 0;
const COST_USD_PRECISION = 12;
const COST_USD_SCALE = 6;
const DEFAULT_LATENCY_MS = 0;

const ColumnName = {
	CONTEXT_USED: "context_used",
	COST_USD: "cost_usd",
	CREATED_AT: "created_at",
	DOCUMENT_ID: "document_id",
	EDITED_STRUCTURED: "edited_structured",
	EDITED_TEXT: "edited_text",
	FROM_CACHE: "from_cache",
	ID: "id",
	INPUT_TOKENS: "input_tokens",
	IS_CURRENT: "is_current",
	LATENCY_MS: "latency_ms",
	MODEL: "model",
	OUTPUT_TOKENS: "output_tokens",
	PAGE_ID: "page_id",
	PRESET_ID: "preset_id",
	PROVIDER: "provider",
	STRUCTURED: "structured",
	TEXT: "text",
	UPDATED_AT: "updated_at",
} as const;

const IndexName = {
	CONTEXT: "transcription_context_idx",
	DOCUMENT: "transcription_doc_idx",
	ONE_CURRENT: "transcription_one_current",
	PAGE: "transcription_page_idx",
} as const;

const PagesColumnName = {
	ID: "id",
} as const;

const DocumentsColumnName = {
	ID: "id",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.raw(`DROP TRIGGER IF EXISTS ${TRIGGER_NAME} ON ${TABLE_NAME}`);
	await knex.schema.dropTableIfExists(TABLE_NAME);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.increments(ColumnName.ID).primary();
		table
			.integer(ColumnName.PAGE_ID)
			.notNullable()
			.references(PagesColumnName.ID)
			.inTable(PAGE_TABLE_NAME)
			.onDelete("CASCADE");
		table
			.integer(ColumnName.DOCUMENT_ID)
			.notNullable()
			.references(DocumentsColumnName.ID)
			.inTable(DOCUMENT_TABLE_NAME)
			.onDelete("CASCADE");
		table.integer(ColumnName.PRESET_ID).nullable();
		table.text(ColumnName.TEXT).notNullable().defaultTo("");
		table.jsonb(ColumnName.STRUCTURED).nullable();
		table.text(ColumnName.EDITED_TEXT).nullable();
		table.jsonb(ColumnName.EDITED_STRUCTURED).nullable();
		table
			.jsonb(ColumnName.CONTEXT_USED)
			.notNullable()
			.defaultTo(knex.raw("'{}'::jsonb"));
		table.text(ColumnName.PROVIDER).nullable();
		table.text(ColumnName.MODEL).nullable();
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
			.integer(ColumnName.LATENCY_MS)
			.notNullable()
			.defaultTo(DEFAULT_LATENCY_MS);
		table.boolean(ColumnName.FROM_CACHE).notNullable().defaultTo(false);
		table.boolean(ColumnName.IS_CURRENT).notNullable().defaultTo(true);
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
	});

	await knex.raw(
		`CREATE UNIQUE INDEX ${IndexName.ONE_CURRENT}
		ON ${TABLE_NAME} (${ColumnName.PAGE_ID})
		WHERE ${ColumnName.IS_CURRENT}`,
	);

	await knex.raw(
		`CREATE INDEX ${IndexName.PAGE} ON ${TABLE_NAME} (${ColumnName.PAGE_ID}, ${ColumnName.CREATED_AT} DESC)`,
	);

	await knex.raw(
		`CREATE INDEX ${IndexName.DOCUMENT} ON ${TABLE_NAME} (${ColumnName.DOCUMENT_ID})`,
	);

	await knex.raw(
		`CREATE INDEX ${IndexName.CONTEXT} ON ${TABLE_NAME} USING GIN (${ColumnName.CONTEXT_USED})`,
	);

	await knex.raw(`
		COMMENT ON COLUMN ${TABLE_NAME}.${ColumnName.CONTEXT_USED} IS
		'A snapshot of the context. Main query: find pages whose context contained a wrong word - context_used -> ''lexiconIds'' @> to_jsonb(id)'
		`);

	await knex.raw(`
	CREATE TRIGGER ${TRIGGER_NAME}
	BEFORE UPDATE ON ${TABLE_NAME}
	FOR EACH ROW
	EXECUTE FUNCTION ${FUNCTION_NAME}()`);
}

export { down, up };
