import { type PresetGetByIdResponseDto } from "@transcripta/shared";

import { type PresetDetailsProperties } from "./libs/types/types.js";

class PresetDetailsEntity {
	private description: string;

	private familyId: number;

	private id: number;

	private instructions: string;

	private name: string;

	private outputSchema: Record<string, unknown>;

	private seedGlossary: Record<string, unknown>[] | string[];

	private constructor({
		description,
		familyId,
		id,
		instructions,
		name,
		outputSchema,
		seedGlossary,
	}: PresetDetailsProperties) {
		this.description = description;
		this.familyId = familyId;
		this.id = id;
		this.instructions = instructions;
		this.name = name;
		this.outputSchema = outputSchema;
		this.seedGlossary = seedGlossary;
	}

	public static initialize(
		properties: PresetDetailsProperties,
	): PresetDetailsEntity {
		return new PresetDetailsEntity(properties);
	}

	public toObject(): PresetGetByIdResponseDto {
		return {
			description: this.description,
			familyId: this.familyId,
			id: this.id,
			instructions: this.instructions,
			name: this.name,
			outputSchema: this.outputSchema,
			seedGlossary: this.seedGlossary,
		};
	}
}

export { PresetDetailsEntity };
