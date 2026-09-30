import { MIN_WORKER_CONCURRENCY } from "./min-worker-concurrency.constant.js";

const WORKER_CONCURRENCY_ERROR_MESSAGE = `must be an integer of at least ${String(MIN_WORKER_CONCURRENCY)}`;

export { WORKER_CONCURRENCY_ERROR_MESSAGE };
