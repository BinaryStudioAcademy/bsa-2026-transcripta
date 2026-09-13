import { createHash } from "node:crypto";

import { CONTEXT_HASH_SEPARATOR } from "../constants/constants.js";

const hashContext = (blocks: string[], model: string): string => {
	return createHash("sha256")
		.update([...blocks, model].join(CONTEXT_HASH_SEPARATOR))
		.digest("hex");
};

export { hashContext };
