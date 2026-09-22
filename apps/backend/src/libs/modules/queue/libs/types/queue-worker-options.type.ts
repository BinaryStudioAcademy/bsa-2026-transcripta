import { type WorkerOptions } from "bullmq";

type QueueWorkerOptions = Pick<WorkerOptions, "concurrency" | "limiter">;

export { type QueueWorkerOptions };
