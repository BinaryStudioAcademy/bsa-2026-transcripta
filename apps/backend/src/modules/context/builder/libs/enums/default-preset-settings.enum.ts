const DefaultPresetSettings = {
	lexiconTopK: 100,
	maxContextTokens: 6000,
	minDistinctPages: 2,
	model: "claude-opus-5",
	neighbourPages: 3,
} as const;

export { DefaultPresetSettings };
