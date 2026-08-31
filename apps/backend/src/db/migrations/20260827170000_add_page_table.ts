import { PageStatus } from "@transcripta/shared";
import { type Knex } from "knex";

const TABLE_NAME = "page";
const PAGE_STATUS_TYPE = "page_status";
const DOCUMENT_TABLE_NAME = "document";
const USERS_TABLE_NAME = "users";

const DEFAULT_ATTEMPTS = 0;

const ColumnName = {
	ATTEMPTS: "attempts",
	CREATED_AT: "created_at",
	DOCUMENT_ID: "document_id",
	ID: "id",
	IMAGE_KEY: "image_key",
	IMAGE_SHA256: "image_sha256",
	LAST_ERROR: "last_error",
	PAGE_NO: "page_no",
	STATUS: "status",
	THUMB_KEY: "thumb_key",
	UPDATED_AT: "updated_at",
	VERIFIED_AT: "verified_at",
	VERIFIED_BY: "verified_by",
} as const;

const IndexName = {
	DOC_NO: "page_doc_no_idx",
	STATUS: "page_status_idx",
	STUCK: "page_stuck_idx",
} as const;

const DocumentColumnName = {
	ID: "id",
} as const;

const UsersColumnName = {
	ID: "id",
} as const;

const PAGE_STATUS_VALUES = [
	PageStatus.PENDING,
	PageStatus.QUEUED,
	PageStatus.TRANSCRIBING,
	PageStatus.TRANSCRIBED,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.SKIPPED,
	PageStatus.BLANK,
	PageStatus.FAILED,
] as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists(TABLE_NAME);
	await knex.raw(`DROP TYPE IF EXISTS ${PAGE_STATUS_TYPE}`);
}

async function up(knex: Knex): Promise<void> {
	const statusValuesSql = PAGE_STATUS_VALUES.map(
		(status) => `'${status}'`,
	).join(", ");

	await knex.raw(
		`CREATE TYPE ${PAGE_STATUS_TYPE} AS ENUM (${statusValuesSql})`,
	);

	await knex.schema.createTable(TABLE_NAME, (table) => {
		table.increments(ColumnName.ID).primary();
		table
			.integer(ColumnName.DOCUMENT_ID)
			.notNullable()
			.references(DocumentColumnName.ID)
			.inTable(DOCUMENT_TABLE_NAME)
			.onDelete("CASCADE");
		table.integer(ColumnName.PAGE_NO).notNullable();
		table.text(ColumnName.IMAGE_KEY).nullable();
		table.text(ColumnName.THUMB_KEY).nullable();
		table.text(ColumnName.IMAGE_SHA256).nullable();
		table
			.enu(ColumnName.STATUS, [...PAGE_STATUS_VALUES], {
				enumName: PAGE_STATUS_TYPE,
				existingType: true,
				useNative: true,
			})
			.notNullable()
			.defaultTo(PageStatus.PENDING);
		table
			.integer(ColumnName.VERIFIED_BY)
			.nullable()
			.references(UsersColumnName.ID)
			.inTable(USERS_TABLE_NAME);
		table.timestamp(ColumnName.VERIFIED_AT, { useTz: true }).nullable();
		table
			.integer(ColumnName.ATTEMPTS)
			.notNullable()
			.defaultTo(DEFAULT_ATTEMPTS);
		table.text(ColumnName.LAST_ERROR).nullable();
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table.unique([ColumnName.DOCUMENT_ID, ColumnName.PAGE_NO], {
			indexName: "page_unique_in_document",
		});
	});

	await knex.raw(`
		ALTER TABLE ${TABLE_NAME}
		ADD CONSTRAINT page_no_positive CHECK (${ColumnName.PAGE_NO} >= 1)
	`);

	await knex.raw(
		`CREATE INDEX ${IndexName.DOC_NO} ON ${TABLE_NAME} (${ColumnName.DOCUMENT_ID}, ${ColumnName.PAGE_NO})`,
	);
	await knex.raw(
		`CREATE INDEX ${IndexName.STATUS} ON ${TABLE_NAME} (${ColumnName.DOCUMENT_ID}, ${ColumnName.STATUS})`,
	);
	await knex.raw(`
		CREATE INDEX ${IndexName.STUCK} ON ${TABLE_NAME} (${ColumnName.UPDATED_AT})
		WHERE ${ColumnName.STATUS} IN ('${PageStatus.QUEUED}', '${PageStatus.TRANSCRIBING}')
	`);
}

export { down, up };
