const normalizeLexiconValue = (value: string): string => {
	return value.trim().toLowerCase().normalize("NFC");
};

export { normalizeLexiconValue };
