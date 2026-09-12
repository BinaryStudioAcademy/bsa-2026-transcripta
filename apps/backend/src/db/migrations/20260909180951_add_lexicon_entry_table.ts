import { type Knex } from "knex";

const TABLE_NAME = "lexicon_entry";
const LEXICON_KIND_TYPE = "lexicon_kind";
const DOCUMENT_TABLE_NAME = "document";

const FUNCTION_NAME = "touch_updated_at";
const TRIGGER_NAME = "lexicon_touch";

const ColumnName = {
	CREATED_AT: "created_at",
	DISTINCT_PAGES: "distinct_pages",
	DOCUMENT_ID: "document_id",
	FIRST_PAGE_NO: "first_page_no",
	FREQ: "freq",
	ID: "id",
	INVALID_REASON: "invalid_reason",
	INVALIDATED_AT: "invalidated_at",
	KIND: "kind",
	LAST_PAGE_NO: "last_page_no",
	UPDATED_AT: "updated_at",
	VALUE_DISPLAY: "value_display",
	VALUE_NORMALIZED: "value_normalized",
} as const;

const IndexName = {
	TOP_K: "lexicon_topk_idx",
} as const;

const ConstraintName = {
	FREQ_POSITIVE: "lexicon_freq_positive",
	UNIQUE_IN_DOCUMENT: "lexicon_unique",
} as const;

const DocumentColumnName = {
	ID: "id",
} as const;

const LexiconKind = {
	ABBREVIATION: "abbreviation",
	FORMULA: "formula",
	OTHER: "other",
	PERSON_NAME: "person_name",
	PLACE: "place",
	SURNAME: "surname",
	TERM: "term",
} as const;

const LexiconKindValues = Object.values(LexiconKind);

const DEFAULT_FREQ_VALUE = 1;
const DEFAULT_DISTINCT_PAGES_VALUE = 1;

async function down(knex: Knex): Promise<void> {
	await knex.raw(`DROP TRIGGER IF EXISTS ${TRIGGER_NAME} ON ${TABLE_NAME}`);
	await knex.schema.dropTableIfExists(TABLE_NAME);
	await knex.raw(`DROP TYPE IF EXISTS ${LEXICON_KIND_TYPE}`);
}

async function up(knex: Knex): Promise<void> {
	const kindValuesSql = LexiconKindValues.map((kind) => `'${kind}'`).join(", ");

	await knex.raw(`CREATE TYPE ${LEXICON_KIND_TYPE} AS ENUM (${kindValuesSql})`);

	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.increments(ColumnName.ID).primary();

		table
			.integer(ColumnName.DOCUMENT_ID)
			.notNullable()
			.references(DocumentColumnName.ID)
			.inTable(DOCUMENT_TABLE_NAME)
			.onDelete("CASCADE");

		table
			.enu(ColumnName.KIND, [...LexiconKindValues], {
				enumName: LEXICON_KIND_TYPE,
				existingType: true,
				useNative: true,
			})
			.notNullable();

		table.text(ColumnName.VALUE_NORMALIZED).notNullable();
		table.text(ColumnName.VALUE_DISPLAY).notNullable();

		table.integer(ColumnName.FREQ).notNullable().defaultTo(DEFAULT_FREQ_VALUE);
		table
			.integer(ColumnName.DISTINCT_PAGES)
			.notNullable()
			.defaultTo(DEFAULT_DISTINCT_PAGES_VALUE);
		table.integer(ColumnName.FIRST_PAGE_NO).notNullable();
		table.integer(ColumnName.LAST_PAGE_NO).notNullable();

		table.timestamp(ColumnName.INVALIDATED_AT, { useTz: true }).nullable();
		table.text(ColumnName.INVALID_REASON).nullable();

		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());

		table.unique(
			[ColumnName.DOCUMENT_ID, ColumnName.KIND, ColumnName.VALUE_NORMALIZED],
			{
				indexName: ConstraintName.UNIQUE_IN_DOCUMENT,
				useConstraint: true,
			},
		);
	});

	await knex.raw(`
	ALTER TABLE ${TABLE_NAME}
	ADD CONSTRAINT ${ConstraintName.FREQ_POSITIVE} CHECK (${ColumnName.FREQ} >= 1)
	`);

	await knex.raw(`
	CREATE INDEX ${IndexName.TOP_K} ON ${TABLE_NAME} (${ColumnName.DOCUMENT_ID}, ${ColumnName.DISTINCT_PAGES} DESC, ${ColumnName.FREQ} DESC)
	WHERE ${ColumnName.INVALIDATED_AT} IS NULL;
	`);

	await knex.raw(`
	CREATE TRIGGER ${TRIGGER_NAME}
	BEFORE UPDATE ON ${TABLE_NAME}
	FOR EACH ROW
	EXECUTE FUNCTION ${FUNCTION_NAME}()`);
}

export { down, up };
