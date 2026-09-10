import { type FailedCallOutcome } from "./failed-call-outcome.type.js";
import { type SuccessfulCallOutcome } from "./successful-call-outcome.type.js";

type CallOutcome = FailedCallOutcome | SuccessfulCallOutcome;

export { type CallOutcome };
