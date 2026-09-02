import { type Knex } from "knex";

const TABLE_NAME = "page_event";
const DOCUMENT_TABLE_NAME = "document";
const PAGE_TABLE_NAME = "page";
const TRANSCRIPTION_TABLE_NAME = "transcription";
const USERS_TABLE_NAME = "users";

const ColumnName = {
	ACTOR_ID: "actor_id",
	CREATED_AT: "created_at",
	DETAILS: "details",
	DOCUMENT_ID: "document_id",
	DURATION_MS: "duration_ms",
	EVENT: "event",
	ID: "id",
	PAGE_ID: "page_id",
	TRANSCRIPTION_ID: "transcription_id",
	UPDATED_AT: "updated_at",
} as const;

const IndexName = {
	DOC: "page_event_doc_idx",
	ONCE: "page_event_once",
	PAGE: "page_event_page_idx",
} as const;

const DocumentColumnName = {
	ID: "id",
} as const;

const PageColumnName = {
	ID: "id",
} as const;

const TranscriptionColumnName = {
	ID: "id",
} as const;

const UsersColumnName = {
	ID: "id",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists(TABLE_NAME);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.increments(ColumnName.ID).primary();
		table
			.integer(ColumnName.DOCUMENT_ID)
			.notNullable()
			.references(DocumentColumnName.ID)
			.inTable(DOCUMENT_TABLE_NAME)
			.onDelete("CASCADE");
		table
			.integer(ColumnName.PAGE_ID)
			.nullable()
			.references(PageColumnName.ID)
			.inTable(PAGE_TABLE_NAME)
			.onDelete("CASCADE");
		table
			.integer(ColumnName.TRANSCRIPTION_ID)
			.nullable()
			.references(TranscriptionColumnName.ID)
			.inTable(TRANSCRIPTION_TABLE_NAME)
			.onDelete("CASCADE");

		table.text(ColumnName.EVENT).notNullable();
		table
			.integer(ColumnName.ACTOR_ID)
			.nullable()
			.references(UsersColumnName.ID)
			.inTable(USERS_TABLE_NAME);

		table.jsonb(ColumnName.DETAILS).notNullable().defaultTo("'{}'::jsonb");

		table.integer(ColumnName.DURATION_MS).nullable();

		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
	});

	await knex.raw(`
	CREATE UNIQUE INDEX ${IndexName.ONCE}
	ON ${TABLE_NAME} (${ColumnName.PAGE_ID}, ${ColumnName.TRANSCRIPTION_ID}, ${ColumnName.EVENT})
	WHERE ${ColumnName.EVENT} IN ('confirm', 'correct', 'skip');

	CREATE INDEX ${IndexName.PAGE} ON ${TABLE_NAME} (${ColumnName.PAGE_ID}, ${ColumnName.CREATED_AT} DESC);
	CREATE INDEX ${IndexName.DOC} ON ${TABLE_NAME} (${ColumnName.DOCUMENT_ID}, ${ColumnName.CREATED_AT} DESC);
	`);
}

export { down, up };
