import { type PageTranscribeJobData } from "~/libs/modules/queue/libs/types/types.js";

type EnqueueTranscribeRetry = (data: PageTranscribeJobData) => Promise<void>;

export { EnqueueTranscribeRetry };
