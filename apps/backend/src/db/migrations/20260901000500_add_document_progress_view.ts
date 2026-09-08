import { type Knex } from "knex";

const VIEW_NAME = "document_progress";

async function down(knex: Knex): Promise<void> {
	await knex.raw(`DROP VIEW IF EXISTS ${VIEW_NAME}`);
}

async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		CREATE VIEW ${VIEW_NAME} AS
		SELECT
			d.id                                                     AS document_id,
			d.title,
			d.status,
			d.page_count,
			d.cursor_page_no,
			d.budget_usd,
			d.spent_usd,
			count(p.*)::int                                          AS pages_total,
			count(p.*) FILTER (WHERE p.status IN ('confirmed','corrected'))::int AS pages_verified,
			count(p.*) FILTER (WHERE p.status = 'transcribed')::int  AS pages_ready_to_check,
			count(p.*) FILTER (WHERE p.status IN ('queued','transcribing'))::int AS pages_in_work,
			count(p.*) FILTER (WHERE p.status = 'pending')::int       AS pages_pending,
			count(p.*) FILTER (WHERE p.status = 'failed')::int       AS pages_failed,
			count(p.*) FILTER (WHERE p.status = 'blank')::int        AS pages_blank,
			count(p.*) FILTER (WHERE p.status = 'skipped')::int      AS pages_skipped,
			CASE WHEN count(p.*) > 0
				THEN round(count(p.*) FILTER (WHERE p.status IN ('confirmed','corrected'))::numeric
					/ count(p.*) * 100, 1)::float8
				ELSE 0 END                                          AS verified_pct,
			CASE WHEN count(p.*) > 0
				THEN round(count(p.*) FILTER (WHERE p.status IN
					('confirmed','corrected','skipped','blank','failed'))::numeric
					/ count(p.*) * 100, 1)::float8
				ELSE 0 END                                          AS closed_pct
		FROM document d
		LEFT JOIN page p ON p.document_id = d.id
		GROUP BY d.id
	`);
}

export { down, up };
