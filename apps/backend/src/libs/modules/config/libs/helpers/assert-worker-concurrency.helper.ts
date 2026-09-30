import {
	MIN_WORKER_CONCURRENCY,
	WORKER_CONCURRENCY_ERROR_MESSAGE,
} from "../constants/constants.js";

const assertWorkerConcurrency = (value: unknown): void => {
	const isValid =
		typeof value === "number" &&
		Number.isInteger(value) &&
		value >= MIN_WORKER_CONCURRENCY;

	if (!isValid) {
		throw new Error(WORKER_CONCURRENCY_ERROR_MESSAGE);
	}
};

export { assertWorkerConcurrency };
