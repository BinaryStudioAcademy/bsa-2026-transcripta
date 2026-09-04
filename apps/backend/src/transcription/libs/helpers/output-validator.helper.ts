import { Ajv, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

type FormatInstaller = (ajv: Ajv) => void;

type ValidationResult = {
	errors: ErrorObject[] | null;
	valid: boolean;
};

const createOutputValidator = (
	schema: Record<string, unknown>,
): ((data: unknown) => ValidationResult) => {
	const ajv = new Ajv({ allErrors: true, strict: false });
	(addFormats as unknown as FormatInstaller)(ajv);

	const validate = ajv.compile(schema);

	return (data: unknown): ValidationResult => {
		const valid = validate(data);

		if (valid) {
			return { errors: null, valid: true };
		}

		return { errors: validate.errors ?? null, valid: false };
	};
};

export { createOutputValidator };
