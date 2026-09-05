import { createHash } from "node:crypto";

const sha256 = (input: string): string =>
	createHash("sha256").update(input).digest("hex");

export { sha256 };
