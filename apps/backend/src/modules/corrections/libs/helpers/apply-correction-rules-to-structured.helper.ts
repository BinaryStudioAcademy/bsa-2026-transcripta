import { type CorrectionRule } from "../types/types.js";
import { applyCorrectionRules } from "./apply-correction-rules.helper.js";

// The structured records feed the CSV export, so they take the same readings
// as the page text; every string value is rewritten, keys are left alone.
const applyCorrectionRulesToStructured = (
	value: unknown,
	rules: CorrectionRule[],
): unknown => {
	if (typeof value === "string") {
		return applyCorrectionRules(value, rules);
	}

	if (Array.isArray(value)) {
		return value.map((item) => applyCorrectionRulesToStructured(item, rules));
	}

	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				applyCorrectionRulesToStructured(item, rules),
			]),
		);
	}

	return value;
};

export { applyCorrectionRulesToStructured };
