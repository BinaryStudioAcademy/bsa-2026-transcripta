import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";

const createContextHash = (contextBlocks: string[]): string => {
	return sha256(contextBlocks.join("\n"));
};

export { createContextHash };
