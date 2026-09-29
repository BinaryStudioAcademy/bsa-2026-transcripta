import { EMPTY_LENGTH } from "@transcripta/shared";

import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";

import {
	MIN_TABLE_LINES,
	TABLE_CELL_SEPARATOR,
} from "../constants/verification.constants.js";
import {
	type PageBlock,
	type PageCell,
	type PageLine,
} from "../types/types.js";

const DIVIDER_CHARACTERS = new Set([" ", "-", ":", TABLE_CELL_SEPARATOR]);

const isTableRow = (line: string): boolean =>
	line.trimStart().startsWith(TABLE_CELL_SEPARATOR);

const isDividerRow = (line: string): boolean => {
	if (!line.includes("-")) {
		return false;
	}

	for (let index = EMPTY_LENGTH; index < line.length; index += ONE_QUANTITY) {
		if (!DIVIDER_CHARACTERS.has(line[index] ?? "")) {
			return false;
		}
	}

	return true;
};

const toCells = ({ start: lineStart, text: line }: PageLine): PageCell[] => {
	const trimmedStart = line.trimStart();
	const leading = line.length - trimmedStart.length;
	const from =
		leading +
		(trimmedStart.startsWith(TABLE_CELL_SEPARATOR)
			? ONE_QUANTITY
			: EMPTY_LENGTH);
	const trimmedEnd = line.trimEnd();
	const to = trimmedEnd.endsWith(TABLE_CELL_SEPARATOR)
		? trimmedEnd.length - ONE_QUANTITY
		: trimmedEnd.length;

	const cells: PageCell[] = [];
	let cursor = from;

	for (const raw of line.slice(from, to).split(TABLE_CELL_SEPARATOR)) {
		const lead = raw.length - raw.trimStart().length;
		cells.push({ start: lineStart + cursor + lead, text: raw.trim() });
		cursor += raw.length + ONE_QUANTITY;
	}

	return cells;
};

const toLines = (text: string): PageLine[] => {
	let start = EMPTY_LENGTH;

	return text.split("\n").map((line) => {
		const pageLine = { start, text: line };
		start += line.length + ONE_QUANTITY;

		return pageLine;
	});
};

const splitPageBlocks = (text: string): PageBlock[] => {
	const blocks: PageBlock[] = [];
	const lines = toLines(text);
	let buffer: PageLine[] = [];

	const flushText = (): void => {
		const [first] = buffer;
		const value = buffer.map((line) => line.text).join("\n");
		buffer = [];

		if (first && value.trim().length > EMPTY_LENGTH) {
			blocks.push({ start: first.start, text: value, type: "text" });
		}
	};

	let index = EMPTY_LENGTH;

	while (index < lines.length) {
		const line = lines[index];

		if (line === undefined) {
			break;
		}

		if (!isTableRow(line.text)) {
			buffer.push(line);
			index += ONE_QUANTITY;
			continue;
		}

		const tableLines: PageLine[] = [];
		let tableLine: PageLine | undefined = line;

		while (tableLine && isTableRow(tableLine.text)) {
			tableLines.push(tableLine);
			index += ONE_QUANTITY;
			tableLine = lines[index];
		}

		const rows = tableLines
			.filter((tableLine) => !isDividerRow(tableLine.text))
			.map((tableLine) => toCells(tableLine));

		if (rows.length < MIN_TABLE_LINES) {
			buffer.push(...tableLines);
			continue;
		}

		flushText();
		blocks.push({ rows, type: "table" });
	}

	flushText();

	return blocks;
};

export { splitPageBlocks };
