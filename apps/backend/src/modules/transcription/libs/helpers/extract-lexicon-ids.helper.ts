const extractLexiconIds = (
	contextUsed: null | Record<string, unknown>,
): number[] => {
	const ids = contextUsed?.["lexiconIds"];

	if (!Array.isArray(ids)) {
		return [];
	}

	return ids.filter((id): id is number => typeof id === "number");
};

export { extractLexiconIds };
