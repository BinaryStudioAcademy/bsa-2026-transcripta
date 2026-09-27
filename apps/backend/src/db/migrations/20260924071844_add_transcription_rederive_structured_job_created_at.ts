import { type Knex } from "knex";

const TABLE_NAME = "transcription";

const ColumnName = {
	REDERIVE_STRUCTURED_JOB_CREATED_AT: "rederive_structured_job_created_at",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropColumn(ColumnName.REDERIVE_STRUCTURED_JOB_CREATED_AT);
	});
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table
			.timestamp(ColumnName.REDERIVE_STRUCTURED_JOB_CREATED_AT, { useTz: true })
			.nullable()
			.defaultTo(null);
	});

	await knex.raw(`
		COMMENT ON COLUMN ${TABLE_NAME}.${ColumnName.REDERIVE_STRUCTURED_JOB_CREATED_AT} IS 'Timestamp of creating the last rederive structured job.'
	`);
}

export { down, up };
