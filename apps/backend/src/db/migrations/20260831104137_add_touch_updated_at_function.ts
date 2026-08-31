import type { Knex } from "knex";

const FUNCTION_NAME = "touch_updated_at";

async function down(knex: Knex): Promise<void> {
	await knex.raw(`
	DROP FUNCTION IF EXISTS ${FUNCTION_NAME}()
`);
}

async function up(knex: Knex): Promise<void> {
	await knex.raw(`
	CREATE OR REPLACE FUNCTION ${FUNCTION_NAME}()
	RETURNS trigger
	LANGUAGE plpgsql
	AS $$
	BEGIN
		NEW.updated_at := now();
		RETURN NEW;
	END;
	$$;
`);
}

export { down, up };
