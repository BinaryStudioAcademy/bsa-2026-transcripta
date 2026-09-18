import {
	LexiconEntryKind,
	type LexiconEntryKindValue,
} from "@transcripta/shared";

import { normalizeLexiconValue } from "../libs/helpers/normalize-lexicon.helper.js";
import { CAPITALISED_REGEX, EMPTY_LENGTH } from "./libs/constants/constants.js";
import { OutputSchemaFields } from "./libs/enums/enums.js";
import { type Entity, type EntityFieldSpec } from "./libs/types/types.js";

class LexiconExtractor {
	private dedupe(entities: Entity[]): Entity[] {
		const seen = new Set<string>();
		const result: Entity[] = [];

		for (const entity of entities) {
			const normalizedValue = normalizeLexiconValue(entity.value);
			if (!normalizedValue) {
				continue;
			}

			const key = `${entity.kind}:${normalizedValue}`;
			if (!seen.has(key)) {
				seen.add(key);
				result.push({
					kind: entity.kind,
					value: entity.value.trim(),
				});
			}
		}

		return result;
	}

	private extractSegmentValues(item: unknown, segment: string): unknown[] {
		if (item == null) {
			return [];
		}

		const items = Array.isArray(item) ? item : [item];
		const results: unknown[] = [];

		for (const element of items) {
			if (typeof element === "object" && element !== null) {
				const value = (element as Record<string, unknown>)[segment];
				if (value != null) {
					results.push(value);
				}
			}
		}

		return results;
	}

	private extractValuesByPath(object: unknown, path: string[]): string[] {
		if (object == null || path.length === EMPTY_LENGTH) {
			return [];
		}

		let current: unknown[] = Array.isArray(object) ? object : [object];

		for (const segment of path) {
			current = current.flatMap((item) =>
				this.extractSegmentValues(item, segment),
			);
		}

		return current
			.flatMap((v) => (Array.isArray(v) ? v : [v]) as unknown[])
			.filter(
				(v): v is string =>
					typeof v === "string" && v.trim().length > EMPTY_LENGTH,
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

	public extractEntities(
		text: null | string | undefined,
		structured: null | Record<string, unknown> | undefined,
		outputSchema?: Record<string, unknown>,
	): Entity[] {
		const rawEntities: Entity[] = [];

		if (structured && outputSchema) {
			const entityFields = this.findEntityFields(outputSchema);

			for (const field of entityFields) {
				const extractedValues = this.extractValuesByPath(
					structured,
					field.path,
				);
				for (const value of extractedValues) {
					rawEntities.push({
						kind: field.kind,
						value: value,
					});
				}
			}
		}

		if (text) {
			const matches = text.matchAll(CAPITALISED_REGEX);
			for (const m of matches) {
				rawEntities.push({
					kind: LexiconEntryKind.OTHER,
					value: m[EMPTY_LENGTH],
				});
			}
		}

		return this.dedupe(rawEntities);
	}
}

export { LexiconExtractor };
