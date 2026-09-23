import { type PresetGetByIdResponseDto } from "@transcripta/shared";

type PresetDetailsProperties = {
	description: string;
	id: number;
	instructions: string;
	name: string;
	outputSchema: Record<string, unknown>;
	seedGlossary: Record<string, unknown>[] | string[];
};

class PresetDetailsEntity {
	private description: string;

	private id: number;

	private instructions: string;

	private name: string;

	private outputSchema: Record<string, unknown>;

	private seedGlossary: Record<string, unknown>[] | string[];

	private constructor({
		description,
		id,
		instructions,
		name,
		outputSchema,
		seedGlossary,
	}: PresetDetailsProperties) {
		this.description = description;
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
			id: this.id,
			instructions: this.instructions,
			name: this.name,
			outputSchema: this.outputSchema,
			seedGlossary: this.seedGlossary,
		};
	}
}

export { PresetDetailsEntity };
