import { Ajv, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

type FormatInstaller = (ajv: Ajv) => void;

type ValidationResult = {
	errors: ErrorObject[] | null;
	valid: boolean;
};

const compiledValidators = new Map<
	string,
	(data: unknown) => ValidationResult
>();

const createOutputValidator = (
	schema: Record<string, unknown>,
): ((data: unknown) => ValidationResult) => {
	const cacheKey = JSON.stringify(schema);
	const cached = compiledValidators.get(cacheKey);

	if (cached) {
		return cached;
	}

	const ajv = new Ajv({ allErrors: true, strict: false });
	(addFormats as unknown as FormatInstaller)(ajv);

	const validate = ajv.compile(schema);

	const validator = (data: unknown): ValidationResult => {
		const valid = validate(data);

		if (valid) {
			return { errors: null, valid: true };
		}

		return { errors: validate.errors ?? null, valid: false };
	};

	compiledValidators.set(cacheKey, validator);

	return validator;
};

export { createOutputValidator };
