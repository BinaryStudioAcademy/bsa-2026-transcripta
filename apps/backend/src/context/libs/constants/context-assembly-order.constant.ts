import { ContextBlockKind } from "../enums/enums.js";

const CONTEXT_ASSEMBLY_ORDER = [
	ContextBlockKind.SEED_GLOSSARY,
	ContextBlockKind.LEXICON,
	ContextBlockKind.NEIGHBOURS,
] as const;

export { CONTEXT_ASSEMBLY_ORDER };
