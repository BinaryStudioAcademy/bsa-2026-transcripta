import { raw, type Transaction } from "objection";

import { CorrectionRuleModel } from "./correction-rule.model.js";
import { normalizeCorrectionValue } from "./libs/helpers/helpers.js";
import {
	type CorrectionRule,
	type CorrectionRuleDraft,
} from "./libs/types/types.js";

class CorrectionRuleRepository {
	private correctionRuleModel: typeof CorrectionRuleModel;

	public constructor(correctionRuleModel: typeof CorrectionRuleModel) {
		this.correctionRuleModel = correctionRuleModel;
	}

	public async findByDocumentId(
		documentId: number,
		trx?: Transaction,
	): Promise<CorrectionRule[]> {
		const rows = await this.correctionRuleModel
			.query(trx)
			.select("misread", "corrected")
			.where({ documentId })
			.orderBy("id", "asc");

		return rows.map(({ corrected, misread }) => ({ corrected, misread }));
	}

	public async saveAll(
		documentId: number,
		drafts: CorrectionRuleDraft[],
		trx?: Transaction,
	): Promise<void> {
		const pending = [...drafts];
		const seen = new Set<string>();

		for (let draft = pending.shift(); draft; draft = pending.shift()) {
			const { corrected, misread } = draft;
			const misreadNormalized = normalizeCorrectionValue(misread);

			if (
				seen.has(misreadNormalized) ||
				misreadNormalized === normalizeCorrectionValue(corrected)
			) {
				continue;
			}

			seen.add(misreadNormalized);

			const previous = await this.correctionRuleModel
				.query(trx)
				.select("corrected")
				.where({ documentId, misreadNormalized })
				.first();

			// The same misreading now has a new reading. Pages the old rule already
			// rewrote carry the old reading, so it has to follow as well.
			if (previous && previous.corrected !== corrected) {
				pending.push({ corrected, misread: previous.corrected });
			}

			// The reader has just settled `corrected` as the right reading, so no
			// earlier rule may rewrite it any more.
			await this.correctionRuleModel
				.query(trx)
				.delete()
				.where({ documentId })
				.where("misreadNormalized", normalizeCorrectionValue(corrected));

			// A rule that produced this misreading now produces the new one, so a
			// word corrected twice ends up pointing at the latest reading rather
			// than forming a chain.
			await this.correctionRuleModel
				.query(trx)
				.patch({ corrected })
				.where({ documentId })
				.where("corrected", misread);

			await this.correctionRuleModel
				.query(trx)
				.insert({
					corrected,
					documentId,
					misread,
					misreadNormalized: normalizeCorrectionValue(misread),
				})
				.onConflict(["documentId", "misreadNormalized"])
				.merge({
					corrected: raw("EXCLUDED.corrected"),
					misread: raw("EXCLUDED.misread"),
					updatedAt: raw("now()"),
				});
		}
	}
}

export { CorrectionRuleRepository };
