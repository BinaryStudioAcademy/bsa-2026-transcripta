import { type Knex } from "knex";

const FUNCTION_NAME = "touch_updated_at";
const TRIGGER_NAME = "document_export_touch";

const DocumentExportType = {
	FORMAT: "document_export_format",
	STATUS: "document_export_status",
} as const;

const TableName = {
	DOCUMENT: "document",
	DOCUMENT_EXPORT: "document_export",
	USERS: "users",
} as const;

const ColumnName = {
	CREATED_AT: "created_at",
	DOCUMENT_ID: "document_id",
	ERROR_MESSAGE: "error_message",
	FINISHED_AT: "finished_at",
	FORMAT: "format",
	ID: "id",
	OBJECT_KEY: "object_key",
	REQUESTED_BY: "requested_by",
	SIZE_BYTES: "size_bytes",
	STATUS: "status",
	UPDATED_AT: "updated_at",
} as const;

const IndexName = {
	DOC_CREATED_AT: "document_export_doc_idx",
} as const;

const ForeignTableColumnName = {
	ID: "id",
} as const;

const DocumentExportFormat = {
	CSV: "csv",
	JSON: "json",
	TXT: "txt",
} as const;

const DocumentExportFormatValues = Object.values(DocumentExportFormat);

const DocumentExportStatus = {
	FAILED: "failed",
	PROCESSING: "processing",
	QUEUED: "queued",
	READY: "ready",
} as const;

const DocumentExportStatusValues = Object.values(DocumentExportStatus);

async function down(knex: Knex): Promise<void> {
	await knex.raw(
		`DROP TRIGGER IF EXISTS ${TRIGGER_NAME} ON ${TableName.DOCUMENT_EXPORT}`,
	);
	await knex.schema.dropTableIfExists(TableName.DOCUMENT_EXPORT);
	await knex.raw(`DROP TYPE IF EXISTS ${DocumentExportType.STATUS}`);
	await knex.raw(`DROP TYPE IF EXISTS ${DocumentExportType.FORMAT}`);
}

async function up(knex: Knex): Promise<void> {
	const formatValuesSql = DocumentExportFormatValues.map(
		(fmt) => `'${fmt}'`,
	).join(", ");
	const statusValuesSql = DocumentExportStatusValues.map(
		(st) => `'${st}'`,
	).join(", ");

	await knex.raw(
		`CREATE TYPE ${DocumentExportType.FORMAT} AS ENUM (${formatValuesSql})`,
	);
	await knex.raw(
		`CREATE TYPE ${DocumentExportType.STATUS} AS ENUM (${statusValuesSql})`,
	);

	await knex.schema.createTable(TableName.DOCUMENT_EXPORT, (table) => {
		table.increments(ColumnName.ID).primary();

		table
			.integer(ColumnName.DOCUMENT_ID)
			.notNullable()
			.references(ForeignTableColumnName.ID)
			.inTable(TableName.DOCUMENT)
			.onDelete("CASCADE");

		table
			.enu(ColumnName.FORMAT, [...DocumentExportFormatValues], {
				enumName: DocumentExportType.FORMAT,
				existingType: true,
				useNative: true,
			})
			.notNullable();

		table
			.enu(ColumnName.STATUS, [...DocumentExportStatusValues], {
				enumName: DocumentExportType.STATUS,
				existingType: true,
				useNative: true,
			})
			.notNullable()
			.defaultTo(DocumentExportStatus.QUEUED);

		table.text(ColumnName.OBJECT_KEY).nullable();

		table
			.integer(ColumnName.REQUESTED_BY)
			.notNullable()
			.references(ForeignTableColumnName.ID)
			.inTable(TableName.USERS);

		table.integer(ColumnName.SIZE_BYTES).nullable();

		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());

		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());

		table.timestamp(ColumnName.FINISHED_AT, { useTz: true }).nullable();

		table.text(ColumnName.ERROR_MESSAGE).nullable();
	});

	await knex.raw(
		`CREATE INDEX ${IndexName.DOC_CREATED_AT} ON ${TableName.DOCUMENT_EXPORT} (${ColumnName.DOCUMENT_ID}, ${ColumnName.CREATED_AT} DESC);`,
	);

	await knex.raw(
		`CREATE TRIGGER ${TRIGGER_NAME} BEFORE UPDATE ON ${TableName.DOCUMENT_EXPORT} FOR EACH ROW EXECUTE FUNCTION ${FUNCTION_NAME}()`,
	);
}

export { down, up };
