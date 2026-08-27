import { type ValueOf } from "../../../../libs/types/types.js";
import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

export { type DocumentStatusValue };
