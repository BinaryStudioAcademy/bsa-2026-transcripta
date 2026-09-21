import { createHash } from "node:crypto";

const createContextHash = (contextBlocks: string[]): string => {
	return createHash("sha256").update(contextBlocks.join("\n")).digest("hex");
};

export { createContextHash };
