import type { Knex } from "knex";

const VIEW_NAME = "document_cost";
const TRANSCRIPTION_TABLE_NAME = "transcription";

async function down(knex: Knex): Promise<void> {
	await knex.schema.raw(`DROP VIEW IF EXISTS ${VIEW_NAME};`);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.raw(`CREATE VIEW ${VIEW_NAME} AS
SELECT
document_id,
count(*)::int                     AS calls,
sum(cost_usd)                     AS total_cost_usd,
sum(input_tokens)::int            AS input_tokens,
sum(output_tokens)::int           AS output_tokens,
round(avg(latency_ms))::int       AS avg_latency_ms,
count(*) FILTER (WHERE from_cache)::int AS cache_hits
FROM ${TRANSCRIPTION_TABLE_NAME}
GROUP BY document_id;`);
}

export { down, up };
