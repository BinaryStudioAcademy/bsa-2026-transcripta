import { GlossaryEntry } from "../types/preset-editor.types.js";

const createEntry = (): GlossaryEntry => ({
	id: crypto.randomUUID(),
	kind: "term",
	value: "",
});

export { createEntry };
