import { CsvHeader } from "../enums/enums.js";
import { type PageItem } from "../types/types.js";

const escapeCsvField = (value: number | string): string => {
	const csvField = String(value);
	if (/[",\n\r]/.test(csvField)) {
		return `"${csvField.replaceAll('"', '""')}"`;
	}
	return csvField;
};

const serializeToCsv = (pages: PageItem[]): string => {
	const header = [CsvHeader.PAGE, CsvHeader.STATUS, CsvHeader.TEXT].join(",");
	const rows = pages.map((p) =>
		[
			escapeCsvField(p.page),
			escapeCsvField(p.status),
			escapeCsvField(p.text),
		].join(","),
	);

	return "\uFEFF" + [header, ...rows].join("\n");
};

export { serializeToCsv };
