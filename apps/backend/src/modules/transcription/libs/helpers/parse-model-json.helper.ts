const parseModelJson = (
	text: string,
): { ok: boolean; value?: Record<string, unknown> } => {
	try {
		return { ok: true, value: JSON.parse(text) as Record<string, unknown> };
	} catch {
		return { ok: false };
	}
};

export { parseModelJson };
