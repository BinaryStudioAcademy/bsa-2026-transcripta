import type { Knex } from "knex";

const VIEW_NAME = "verification_speed";
const PAGE_EVENT_TABLE_NAME = "page_event";

async function down(knex: Knex): Promise<void> {
	await knex.schema.raw(`DROP VIEW IF EXISTS ${VIEW_NAME};`);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.raw(`
		CREATE VIEW ${VIEW_NAME} AS
		SELECT
			document_id,
			actor_id,
			count(*)::int AS pages,
			round(avg(duration_ms))::int AS avg_ms,
			percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms) AS median_ms,
			round(
				count(*) FILTER (WHERE event = 'confirm')::numeric
				/ nullif(
					count(*) FILTER (WHERE event IN ('confirm', 'correct')),
					0
				),
				3
			)::float8 AS clean_rate
		FROM ${PAGE_EVENT_TABLE_NAME}
		WHERE event IN ('confirm', 'correct')
			AND duration_ms IS NOT NULL
		GROUP BY document_id, actor_id;
	`);
}

export { down, up };
