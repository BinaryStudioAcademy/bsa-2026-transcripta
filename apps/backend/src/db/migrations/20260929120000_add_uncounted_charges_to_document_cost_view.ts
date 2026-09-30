import { type Knex } from "knex";

const VIEW_NAME = "document_cost";
const TRANSCRIPTION_TABLE_NAME = "transcription";
const PAGE_EVENT_TABLE_NAME = "page_event";
const RATE_LIMITED_EVENT_NAME = "transcribe_rate_limited";
const FAILED_EVENT_NAME = "transcribe_failed";

/**
 * Two worker paths charge document.spent_usd without writing a transcription
 * row (TSA-495): a rate-limited repair call and a retryable failure that is
 * sent back to the queue. Their charge lives only in page_event
 * (details.costUsd) with transcription_id = NULL. The view now sums those
 * events too, so it matches what budget enforcement already counts.
 *
 * Events linked to a transcription row are skipped: that row already holds
 * the cost. calls, avg_latency_ms and cache_hits still describe transcription
 * rows only.
 */
async function down(knex: Knex): Promise<void> {
	await knex.schema.raw(`DROP VIEW IF EXISTS ${VIEW_NAME};`);

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

async function up(knex: Knex): Promise<void> {
	await knex.schema.raw(`DROP VIEW IF EXISTS ${VIEW_NAME};`);

	await knex.schema.raw(`CREATE VIEW ${VIEW_NAME} AS
SELECT
document_id,
count(*) FILTER (WHERE is_transcription)::int AS calls,
sum(cost_usd)                     AS total_cost_usd,
sum(input_tokens)::int            AS input_tokens,
sum(output_tokens)::int           AS output_tokens,
round(avg(latency_ms))::int       AS avg_latency_ms,
count(*) FILTER (WHERE from_cache)::int AS cache_hits
FROM (
	SELECT
	document_id,
	cost_usd,
	input_tokens,
	output_tokens,
	latency_ms,
	from_cache,
	true AS is_transcription
	FROM ${TRANSCRIPTION_TABLE_NAME}

	UNION ALL

	SELECT
	document_id,
	(details ->> 'costUsd')::numeric(12,6),
	coalesce((details ->> 'inputTokens')::int, 0),
	coalesce((details ->> 'outputTokens')::int, 0),
	NULL::int,
	false,
	false
	FROM ${PAGE_EVENT_TABLE_NAME}
	WHERE event IN ('${RATE_LIMITED_EVENT_NAME}', '${FAILED_EVENT_NAME}')
	AND transcription_id IS NULL
	AND (details ->> 'costUsd')::numeric > 0
) AS charge
GROUP BY document_id;`);
}

export { down, up };
