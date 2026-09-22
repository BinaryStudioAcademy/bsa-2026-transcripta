import { type Knex } from "knex";

const TABLE_NAME = "lexicon_entry";

const ColumnName = {
	FREQ: "freq",
	PAGE_COUNT: "page_count",
} as const;

const ConstraintName = {
	FREQ_POSITIVE: "lexicon_freq_positive",
	PAGE_COUNT_POSITIVE: "lexicon_page_count_positive",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.renameColumn(ColumnName.PAGE_COUNT, ColumnName.FREQ);
	});

	await knex.raw(`
		ALTER TABLE ${TABLE_NAME}
		RENAME CONSTRAINT ${ConstraintName.PAGE_COUNT_POSITIVE}
		TO ${ConstraintName.FREQ_POSITIVE}
	`);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.renameColumn(ColumnName.FREQ, ColumnName.PAGE_COUNT);
	});

	await knex.raw(`
		ALTER TABLE ${TABLE_NAME}
		RENAME CONSTRAINT ${ConstraintName.FREQ_POSITIVE}
		TO ${ConstraintName.PAGE_COUNT_POSITIVE}
	`);
}

export { down, up };
