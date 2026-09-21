import { type Knex } from "knex";

const TABLE_NAME = "page_event";
const ATTEMPT_COLUMN = "attempt";
const DEFAULT_ATTEMPT = 0;
const ONCE_INDEX = "page_event_once";

async function down(knex: Knex): Promise<void> {
	await knex.raw(`
		DROP INDEX IF EXISTS ${ONCE_INDEX};
	`);

	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropColumn(ATTEMPT_COLUMN);
	});

	await knex.raw(`
		CREATE UNIQUE INDEX ${ONCE_INDEX}
		ON ${TABLE_NAME} (page_id, transcription_id, event)
		WHERE event IN ('confirm', 'correct', 'skip');
	`);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.integer(ATTEMPT_COLUMN).notNullable().defaultTo(DEFAULT_ATTEMPT);
	});

	await knex.raw(`
		DROP INDEX ${ONCE_INDEX};

		CREATE UNIQUE INDEX ${ONCE_INDEX}
		ON ${TABLE_NAME} (page_id, transcription_id, event, attempt)
		WHERE event IN ('confirm', 'correct', 'skip');
	`);
}

export { down, up };
