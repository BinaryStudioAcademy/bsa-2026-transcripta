import { raw, type Transaction } from "objection";

import { LexiconEntryEntity } from "./lexicon-entry.entity.js";
import { type LexiconEntryModel } from "./lexicon-entry.model.js";
import { type UpsertLexiconEntryPayload } from "./libs/types/types.js";

class LexiconEntryRepository {
	private lexiconEntryModel: typeof LexiconEntryModel;

	constructor(lexiconEntryModel: typeof LexiconEntryModel) {
		this.lexiconEntryModel = lexiconEntryModel;
	}

	public async upsertFromPage(
		payload: UpsertLexiconEntryPayload[],
		trx: Transaction,
	): Promise<LexiconEntryEntity[]> {
		const rows = payload.map((entry) => ({
			distinctPages: 1,
			documentId: entry.documentId,
			firstPageNo: entry.pageNo,
			freq: 1,
			kind: entry.kind,
			lastPageNo: entry.pageNo,
			valueDisplay: entry.valueDisplay,
			valueNormalized: entry.valueNormalized,
		}));

		const entries = await this.lexiconEntryModel
			.query(trx)
			.insert(rows)
			.onConflict(["documentId", "kind", "valueNormalized"])
			.merge({
				distinctPages: raw(`
						lexicon_entry.distinct_pages +
							CASE
								WHEN lexicon_entry.last_page_no <> EXCLUDED.last_page_no
								THEN 1
								ELSE 0
							END
					`),
				freq: raw("lexicon_entry.freq + 1"),
				lastPageNo: raw("EXCLUDED.last_page_no"),
				updatedAt: raw("now()"),
			})
			.returning("*");

		return entries.map((entry) => LexiconEntryEntity.initialize(entry));
	}
}

export { LexiconEntryRepository };
