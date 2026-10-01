import { EMPTY_LENGTH } from "@transcripta/shared";
import { type Transaction } from "objection";

import { type TranscriptionRepository } from "~/modules/transcription/transcription.repository.js";

import { type CorrectionRuleRepository } from "./correction-rule.repository.js";
import {
	applyCorrectionRules,
	applyCorrectionRulesToStructured,
	extractCorrectionRules,
} from "./libs/helpers/helpers.js";
import { type LearnFromCorrectionPayload } from "./libs/types/types.js";

class CorrectionService {
	private correctionRuleRepository: CorrectionRuleRepository;

	private transcriptionRepository: TranscriptionRepository;

	public constructor({
		correctionRuleRepository,
		transcriptionRepository,
	}: {
		correctionRuleRepository: CorrectionRuleRepository;
		transcriptionRepository: TranscriptionRepository;
	}) {
		this.correctionRuleRepository = correctionRuleRepository;
		this.transcriptionRepository = transcriptionRepository;
	}

	// Records what the reader replaced and rewrites the pages nobody has checked
	// yet, in the same transaction as the correction. The text changes in place,
	// so no model call is made and the pages keep the ids the screen holds.
	public async learnFromCorrection({
		corrected,
		documentId,
		original,
		pageId,
		trx,
	}: LearnFromCorrectionPayload & { trx: Transaction }): Promise<void> {
		const drafts = extractCorrectionRules(original, corrected);

		if (drafts.length === EMPTY_LENGTH) {
			return;
		}

		await this.correctionRuleRepository.saveAll(documentId, drafts, trx);

		const rules = await this.correctionRuleRepository.findByDocumentId(
			documentId,
			trx,
		);
		const unreviewed =
			await this.transcriptionRepository.findCurrentOfUnreviewedPages(
				documentId,
				pageId,
				trx,
			);

		for (const row of unreviewed) {
			const text = applyCorrectionRules(row.text, rules);
			const structured = applyCorrectionRulesToStructured(
				row.structured,
				rules,
			) as typeof row.structured;

			const isUnchanged =
				text === row.text &&
				JSON.stringify(structured) === JSON.stringify(row.structured);

			if (isUnchanged) {
				continue;
			}

			await this.transcriptionRepository.updateModelOutput(
				row.id,
				{ structured, text },
				trx,
			);
		}
	}
}

export { CorrectionService };
