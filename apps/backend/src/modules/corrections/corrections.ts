import { CorrectionRuleModel } from "./correction-rule.model.js";
import { CorrectionRuleRepository } from "./correction-rule.repository.js";

const correctionRuleRepository = new CorrectionRuleRepository(
	CorrectionRuleModel,
);

export { correctionRuleRepository };
export { CorrectionService } from "./correction.service.js";
