import { DocumentStatus } from "@transcripta/shared";
import { type Knex } from "knex";

const TABLE_NAME = "document";
const DOCUMENT_STATUS_TYPE = "document_status";
const USERS_TABLE_NAME = "users";

const DEFAULT_BUDGET_USD = 10;
const DEFAULT_CURSOR_PAGE_NO = 1;
const DEFAULT_PAGE_COUNT = 0;
const DEFAULT_SPENT_USD = 0;
const BUDGET_USD_PRECISION = 10;
const BUDGET_USD_SCALE = 4;
const SPENT_USD_PRECISION = 12;
const SPENT_USD_SCALE = 6;

const ColumnName = {
	BUDGET_USD: "budget_usd",
	CREATED_AT: "created_at",
	CURSOR_PAGE_NO: "cursor_page_no",
	ERROR_MESSAGE: "error_message",
	ID: "id",
	OWNER_ID: "owner_id",
	PAGE_COUNT: "page_count",
	PRESET_ID: "preset_id",
	SOURCE_BYTES: "source_bytes",
	SOURCE_KEY: "source_key",
	SOURCE_NAME: "source_name",
	SPENT_USD: "spent_usd",
	STATUS: "status",
	TITLE: "title",
	UPDATED_AT: "updated_at",
} as const;

const IndexName = {
	OWNER: "document_owner_idx",
	STATUS: "document_status_idx",
} as const;

const UsersColumnName = {
	ID: "id",
} as const;

const DOCUMENT_STATUS_VALUES = [
	DocumentStatus.DRAFT,
	DocumentStatus.INGESTING,
	DocumentStatus.READY,
	DocumentStatus.PROCESSING,
	DocumentStatus.PAUSED,
	DocumentStatus.BUDGET_STOP,
	DocumentStatus.DONE,
	DocumentStatus.FAILED,
] as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists(TABLE_NAME);
	await knex.raw(`DROP TYPE IF EXISTS ${DOCUMENT_STATUS_TYPE}`);
}

async function up(knex: Knex): Promise<void> {
	const statusValuesSql = DOCUMENT_STATUS_VALUES.map(
		(status) => `'${status}'`,
	).join(", ");

	await knex.raw(
		`CREATE TYPE ${DOCUMENT_STATUS_TYPE} AS ENUM (${statusValuesSql})`,
	);

	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.increments(ColumnName.ID).primary();
		table
			.integer(ColumnName.OWNER_ID)
			.notNullable()
			.references(UsersColumnName.ID)
			.inTable(USERS_TABLE_NAME);
		table.integer(ColumnName.PRESET_ID).nullable();
		table.text(ColumnName.TITLE).notNullable();
		table
			.enu(ColumnName.STATUS, [...DOCUMENT_STATUS_VALUES], {
				enumName: DOCUMENT_STATUS_TYPE,
				existingType: true,
				useNative: true,
			})
			.notNullable()
			.defaultTo(DocumentStatus.DRAFT);
		table.text(ColumnName.SOURCE_KEY).nullable();
		table.text(ColumnName.SOURCE_NAME).nullable();
		table.bigInteger(ColumnName.SOURCE_BYTES).nullable();
		table
			.integer(ColumnName.PAGE_COUNT)
			.notNullable()
			.defaultTo(DEFAULT_PAGE_COUNT);
		table
			.integer(ColumnName.CURSOR_PAGE_NO)
			.notNullable()
			.defaultTo(DEFAULT_CURSOR_PAGE_NO);
		table
			.decimal(ColumnName.BUDGET_USD, BUDGET_USD_PRECISION, BUDGET_USD_SCALE)
			.notNullable()
			.defaultTo(DEFAULT_BUDGET_USD);
		table
			.decimal(ColumnName.SPENT_USD, SPENT_USD_PRECISION, SPENT_USD_SCALE)
			.notNullable()
			.defaultTo(DEFAULT_SPENT_USD);
		table.text(ColumnName.ERROR_MESSAGE).nullable();
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table.index([ColumnName.STATUS], IndexName.STATUS);
	});

	await knex.raw(`
		ALTER TABLE ${TABLE_NAME}
		ADD CONSTRAINT document_pages_nonneg CHECK (${ColumnName.PAGE_COUNT} >= 0),
		ADD CONSTRAINT document_budget_nonneg CHECK (${ColumnName.BUDGET_USD} >= 0 AND ${ColumnName.SPENT_USD} >= 0)
	`);

	await knex.raw(
		`CREATE INDEX ${IndexName.OWNER} ON ${TABLE_NAME} (${ColumnName.OWNER_ID}, ${ColumnName.CREATED_AT} DESC)`,
	);
}

export { down, up };
