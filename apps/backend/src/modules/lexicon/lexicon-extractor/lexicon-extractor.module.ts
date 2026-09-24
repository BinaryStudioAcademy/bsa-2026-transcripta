import {
	LexiconEntryKind,
	type LexiconEntryKindValue,
} from "@transcripta/shared";

import { normalizeLexiconValue } from "../libs/helpers/normalize-lexicon.helper.js";
import {
	CAPITALISED_REGEX,
	IGNORED_ABBREVIATIONS,
	ONE,
	SINGLE_LETTER_REGEX,
	TOKEN_CHARACTER_REGEX,
	WHITESPACE_REGEX,
	ZERO,
} from "./libs/constants/constants.js";
import { OutputSchemaFields } from "./libs/enums/enums.js";
import { type Entity, type EntityFieldSpec } from "./libs/types/types.js";

class LexiconExtractor {
	private dedupe(entities: Entity[]): Entity[] {
		const typedValues = new Set(
			entities
				.filter((entity) => entity.kind !== LexiconEntryKind.OTHER)
				.map((entity) => normalizeLexiconValue(entity.value)),
		);

		const seen = new Set<string>();
		const result: Entity[] = [];

		for (const entity of entities) {
			const normalizedValue = normalizeLexiconValue(entity.value);

			if (!normalizedValue) {
				continue;
			}

			if (
				entity.kind === LexiconEntryKind.OTHER &&
				typedValues.has(normalizedValue)
			) {
				continue;
			}

			const key = `${entity.kind}:${normalizedValue}`;

			if (seen.has(key)) {
				continue;
			}

			seen.add(key);

			result.push({
				kind: entity.kind,
				value: entity.value.trim().normalize("NFC"),
			});
		}

		return result;
	}

	private extractSegmentValues(item: unknown, segment: string): unknown[] {
		const items = Array.isArray(item) ? (item as unknown[]) : [item];

		const results: unknown[] = [];

		for (const element of items) {
			if (typeof element !== "object" || element === null) {
				continue;
			}

			const value = (element as Record<string, unknown>)[segment];

			if (value == null) {
				continue;
			}

			if (Array.isArray(value)) {
				results.push(...(value as unknown[]));
			} else {
				results.push(value);
			}
		}

		return results;
	}

	private extractStructuredEntities(
		structured: null | Record<string, unknown> | undefined,
		outputSchema?: Record<string, unknown>,
	): Entity[] {
		if (!structured || !outputSchema) {
			return [];
		}

		const entities: Entity[] = [];
		const entityFields = this.findEntityFields(outputSchema);

		for (const field of entityFields) {
			const values = this.extractValuesByPath(structured, field.path);

			for (const value of values) {
				entities.push({
					kind: field.kind,
					value,
				});
			}
		}

		return entities;
	}

	private extractTextEntities(text: null | string | undefined): Entity[] {
		if (!text) {
			return [];
		}

		const entities: Entity[] = [];

		for (const match of text.matchAll(CAPITALISED_REGEX)) {
			const value = match[ZERO];

			if (this.shouldIgnoreTextCandidate(text, value, match.index)) {
				continue;
			}

			entities.push({
				kind: LexiconEntryKind.OTHER,
				value,
			});
		}

		return entities;
	}

	private extractValuesByPath(object: unknown, path: string[]): string[] {
		if (object == null || path.length === ZERO) {
			return [];
		}

		let values: unknown[] = Array.isArray(object)
			? (object as unknown[])
			: [object];

		for (const segment of path) {
			values = values.flatMap((value) =>
				this.extractSegmentValues(value, segment),
			);
		}

		return values.filter(
			(value): value is string =>
				typeof value === "string" && value.trim().length > ZERO,
		);
	}

	private findEntityFields(
		schema: Record<string, unknown>,
		currentPath: string[] = [],
	): EntityFieldSpec[] {
		const fields: EntityFieldSpec[] = [];

		if (typeof schema[OutputSchemaFields.X_ENTITY_KIND] === "string") {
			fields.push({
				kind: schema[OutputSchemaFields.X_ENTITY_KIND] as LexiconEntryKindValue,
				path: currentPath,
			});
		}

		if (
			schema[OutputSchemaFields.PROPERTIES] &&
			typeof schema[OutputSchemaFields.PROPERTIES] === "object"
		) {
			for (const [key, propertySchema] of Object.entries(
				schema[OutputSchemaFields.PROPERTIES] as Record<string, unknown>,
			)) {
				fields.push(
					...this.findEntityFields(propertySchema as Record<string, unknown>, [
						...currentPath,
						key,
					]),
				);
			}
		}

		if (
			schema[OutputSchemaFields.ITEMS] &&
			typeof schema[OutputSchemaFields.ITEMS] === "object"
		) {
			fields.push(
				...this.findEntityFields(
					schema[OutputSchemaFields.ITEMS] as Record<string, unknown>,
					currentPath,
				),
			);
		}

		return fields;
	}

	private findPreviousNonWhitespaceIndex(
		text: string,
		startIndex: number,
	): number {
		let index = startIndex;

		while (index >= ZERO && WHITESPACE_REGEX.test(text[index] ?? "")) {
			index--;
		}

		return index;
	}

	private getTokenBeforeIndex(text: string, index: number): string {
		let tokenStart = index - ONE;

		while (
			tokenStart >= ZERO &&
			TOKEN_CHARACTER_REGEX.test(text[tokenStart] ?? "")
		) {
			tokenStart--;
		}

		return text.slice(tokenStart + ONE, index);
	}

	private isAbbreviationOrInitial(
		text: string,
		value: string,
		index: number,
	): boolean {
		if (text[index + value.length] !== ".") {
			return false;
		}

		return (
			SINGLE_LETTER_REGEX.test(value.normalize("NFC")) ||
			IGNORED_ABBREVIATIONS.has(value)
		);
	}
	private isSentenceStart(text: string, index: number): boolean {
		if (index === ZERO) {
			return true;
		}

		const previousIndex = this.findPreviousNonWhitespaceIndex(
			text,
			index - ONE,
		);

		if (previousIndex < ZERO || text[previousIndex] !== ".") {
			return previousIndex < ZERO;
		}

		const previousToken = this.getTokenBeforeIndex(text, previousIndex);

		const isInitial = SINGLE_LETTER_REGEX.test(previousToken.normalize("NFC"));

		return !isInitial && !IGNORED_ABBREVIATIONS.has(previousToken);
	}
	private shouldIgnoreTextCandidate(
		text: string,
		value: string,
		index: number,
	): boolean {
		return (
			this.isAbbreviationOrInitial(text, value, index) ||
			this.isSentenceStart(text, index)
		);
	}

	public extractEntities(
		text: null | string | undefined,
		structured: null | Record<string, unknown> | undefined,
		outputSchema?: Record<string, unknown>,
	): Entity[] {
		const entities = [
			...this.extractStructuredEntities(structured, outputSchema),
			...this.extractTextEntities(text),
		];

		return this.dedupe(entities);
	}
}

export { LexiconExtractor };
