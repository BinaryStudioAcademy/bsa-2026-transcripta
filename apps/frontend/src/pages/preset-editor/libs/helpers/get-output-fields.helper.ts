const getOutputFields = (outputSchema: Record<string, unknown>): string[] => {
	const properties = outputSchema["properties"];

	if (!properties || typeof properties !== "object") {
		return [];
	}

	const records = (properties as Record<string, unknown>)["records"];

	if (!records || typeof records !== "object") {
		return [];
	}

	const items = (records as Record<string, unknown>)["items"];

	if (!items || typeof items !== "object") {
		return [];
	}

	const itemProperties = (items as Record<string, unknown>)["properties"];

	if (!itemProperties || typeof itemProperties !== "object") {
		return [];
	}

	return Object.keys(itemProperties);
};

export { getOutputFields };
