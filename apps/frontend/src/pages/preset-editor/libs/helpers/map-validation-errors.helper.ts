import { type ZodIssue } from "zod";

import {
	type GlossaryEntry,
	type PresetFormErrors,
} from "../types/preset-editor.types.js";
import { getInitialErrors } from "./get-initial-errors.helper.js";

const mapValidationErrors = (
	issues: ZodIssue[],
	entries: GlossaryEntry[],
): PresetFormErrors => {
	const errors = getInitialErrors();

	for (const issue of issues) {
		const [field, index, nestedField] = issue.path;

		switch (field) {
			case "description": {
				errors.description = issue.message;
				break;
			}
			case "instructions": {
				errors.instructions = issue.message;
				break;
			}
			case "name": {
				errors.name = issue.message;
				break;
			}
			case "seedGlossary": {
				if (typeof index === "number" && nestedField === "value") {
					const entry = entries[index];

					if (entry) {
						errors.glossary[entry.id] = issue.message;
					}
				}

				break;
			}
			default: {
				break;
			}
		}
	}

	return errors;
};

export { mapValidationErrors };
