const normalizeCorrectionValue = (value: string): string =>
	value.trim().toLowerCase().normalize("NFC");

export { normalizeCorrectionValue };
