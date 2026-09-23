import { EMPTY_LENGTH } from "@transcripta/shared";

import { ONE_QUANTITY } from "~/libs/constants/common.constants.js";

import {
	MIN_TABLE_LINES,
	TABLE_CELL_SEPARATOR,
} from "../constants/verification.constants.js";
import { type PageBlock } from "../types/types.js";

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

const toCells = (line: string): string[] => {
	const trimmed = line.trim();
	const inner = trimmed.slice(
		trimmed.startsWith(TABLE_CELL_SEPARATOR) ? ONE_QUANTITY : EMPTY_LENGTH,
		trimmed.endsWith(TABLE_CELL_SEPARATOR)
			? trimmed.length - ONE_QUANTITY
			: trimmed.length,
	);

	return inner.split(TABLE_CELL_SEPARATOR).map((cell) => cell.trim());
};

const splitPageBlocks = (text: string): PageBlock[] => {
	const blocks: PageBlock[] = [];
	const lines = text.split("\n");
	let buffer: string[] = [];

	const flushText = (): void => {
		if (buffer.length === EMPTY_LENGTH) {
			return;
		}

		const value = buffer.join("\n");
		buffer = [];

		if (value.trim().length > EMPTY_LENGTH) {
			blocks.push({ text: value, type: "text" });
		}
	};

	let index = EMPTY_LENGTH;

	while (index < lines.length) {
		const line = lines[index] ?? "";

		if (!isTableRow(line)) {
			buffer.push(line);
			index += ONE_QUANTITY;
			continue;
		}

		const tableLines: string[] = [];

		while (index < lines.length && isTableRow(lines[index] ?? "")) {
			tableLines.push(lines[index] ?? "");
			index += ONE_QUANTITY;
		}

		const rows = tableLines
			.filter((tableLine) => !isDividerRow(tableLine))
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
