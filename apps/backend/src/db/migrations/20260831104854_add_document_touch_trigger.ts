import type { Knex } from "knex";

const TABLE_NAME = "document";
const FUNCTION_NAME = "touch_updated_at";
const TRIGGER_NAME = "document_touch";

async function down(knex: Knex): Promise<void> {
	await knex.raw(`DROP TRIGGER IF EXISTS ${TRIGGER_NAME} ON ${TABLE_NAME}`);
}

async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		CREATE TRIGGER ${TRIGGER_NAME}
		BEFORE UPDATE ON ${TABLE_NAME}
		FOR EACH ROW
		EXECUTE FUNCTION ${FUNCTION_NAME}()
	`);
}

export { down, up };
