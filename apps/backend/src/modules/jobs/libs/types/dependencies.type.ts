import {
	type EnqueueTranscribeRetry,
	type TranscribeDependencies,
} from "./types.js";

type Dependencies = TranscribeDependencies & {
	enqueueRetry: EnqueueTranscribeRetry;
};

export { type Dependencies };
