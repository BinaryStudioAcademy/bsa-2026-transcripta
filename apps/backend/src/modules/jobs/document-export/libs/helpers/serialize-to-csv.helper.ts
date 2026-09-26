import {
	BOM,
	CSV_ESCAPE_TRIGGER,
	DOUBLE_QUOTES,
	TWO_DOUBLE_QUOTES,
} from "../constants/constants.js";
import { CsvHeader } from "../enums/enums.js";
import { type PageItem } from "../types/types.js";

const escapeCsvField = (value: number | string): string => {
	const csvField = String(value);
	if (CSV_ESCAPE_TRIGGER.test(csvField)) {
		return `"${csvField.replaceAll(DOUBLE_QUOTES, TWO_DOUBLE_QUOTES)}"`;
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

	return BOM + [header, ...rows].join("\n");
};

export { serializeToCsv };
