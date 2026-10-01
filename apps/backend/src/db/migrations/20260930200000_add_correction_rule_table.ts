import { type Knex } from "knex";

const TABLE_NAME = "correction_rule";
const DOCUMENT_TABLE_NAME = "document";

const ColumnName = {
	CORRECTED: "corrected",
	CREATED_AT: "created_at",
	DOCUMENT_ID: "document_id",
	ID: "id",
	MISREAD: "misread",
	MISREAD_NORMALIZED: "misread_normalized",
	UPDATED_AT: "updated_at",
} as const;

const ConstraintName = {
	UNIQUE_IN_DOCUMENT: "correction_rule_unique",
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
			.references("id")
			.inTable(DOCUMENT_TABLE_NAME)
			.onDelete("CASCADE");
		table.text(ColumnName.MISREAD).notNullable();
		table.text(ColumnName.MISREAD_NORMALIZED).notNullable();
		table.text(ColumnName.CORRECTED).notNullable();
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());

		table.unique([ColumnName.DOCUMENT_ID, ColumnName.MISREAD_NORMALIZED], {
			indexName: ConstraintName.UNIQUE_IN_DOCUMENT,
		});
	});

	await knex.raw(`
		COMMENT ON TABLE ${TABLE_NAME} IS 'What a reader replaced a misread word with, reapplied to later pages of the same document.'
	`);
}

export { down, up };
