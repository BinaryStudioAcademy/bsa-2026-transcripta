const LEXICON_CONTEXT_ORDER = [
	{ column: "distinctPages", order: "desc" },
	{ column: "freq", order: "desc" },
	{ column: "valueDisplay", order: "asc" },
] as const;

export { LEXICON_CONTEXT_ORDER };
