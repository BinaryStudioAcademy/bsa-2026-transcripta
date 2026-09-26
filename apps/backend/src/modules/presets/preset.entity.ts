import {
	type PresetCreateResponseDto,
	type PresetGetAllItemResponseDto,
} from "@transcripta/shared";

import { type Entity } from "~/libs/types/types.js";

type SeedGlossary = Record<string, unknown>[] | string[];

class PresetEntity implements Entity {
	private createdAt: string;

	private description: string;

	private familyId: null | number;

	private id: null | number;

	private instructions: string;

	private isPublic: boolean;

	private name: string;

	private outputSchema: Record<string, unknown>;

	private ownerId: null | number;

	private seedGlossary: SeedGlossary;

	private settings: Record<string, unknown>;

	private version: number;

	private constructor({
		createdAt,
		description,
		familyId,
		id,
		instructions,
		isPublic,
		name,
		outputSchema,
		ownerId,
		seedGlossary,
		settings,
		version,
	}: {
		createdAt: string;
		description: string;
		familyId: null | number;
		id: null | number;
		instructions: string;
		isPublic: boolean;
		name: string;
		outputSchema: Record<string, unknown>;
		ownerId: null | number;
		seedGlossary: SeedGlossary;
		settings: Record<string, unknown>;
		version: number;
	}) {
		this.createdAt = createdAt;
		this.description = description;
		this.familyId = familyId;
		this.id = id;
		this.instructions = instructions;
		this.isPublic = isPublic;
		this.name = name;
		this.outputSchema = outputSchema;
		this.ownerId = ownerId;
		this.seedGlossary = seedGlossary;
		this.settings = settings;
		this.version = version;
	}

	public static initialize({
		createdAt,
		description,
		familyId,
		id,
		instructions,
		isPublic,
		name,
		outputSchema,
		ownerId,
		seedGlossary,
		settings,
		version,
	}: {
		createdAt: string;
		description: string;
		familyId: null | number;
		id: number;
		instructions: string;
		isPublic: boolean;
		name: string;
		outputSchema: Record<string, unknown>;
		ownerId: null | number;
		seedGlossary: SeedGlossary;
		settings: Record<string, unknown>;
		version: number;
	}): PresetEntity {
		return new PresetEntity({
			createdAt,
			description,
			familyId,
			id,
			instructions,
			isPublic,
			name,
			outputSchema,
			ownerId,
			seedGlossary,
			settings,
			version,
		});
	}

	public static initializeNew({
		description,
		familyId,
		instructions,
		isPublic,
		name,
		outputSchema,
		ownerId,
		seedGlossary,
		settings,
		version,
	}: {
		description: string;
		familyId: null | number;
		instructions: string;
		isPublic: boolean;
		name: string;
		outputSchema: Record<string, unknown>;
		ownerId: number;
		seedGlossary: SeedGlossary;
		settings: Record<string, unknown>;
		version: number;
	}): PresetEntity {
		return new PresetEntity({
			createdAt: "",
			description,
			familyId,
			id: null,
			instructions,
			isPublic,
			name,
			outputSchema,
			ownerId,
			seedGlossary,
			settings,
			version,
		});
	}

	public getFamilyId(): number {
		return this.familyId as number;
	}

	public getOutputSchema(): Record<string, unknown> {
		return this.outputSchema;
	}

	public getOwnerId(): null | number {
		return this.ownerId;
	}

	public getSettings(): Record<string, unknown> {
		return this.settings;
	}

	public getVersion(): number {
		return this.version;
	}

	public toCreateResponseObject(): PresetCreateResponseDto {
		return {
			createdAt: this.createdAt,
			description: this.description,
			familyId: this.familyId as number,
			id: this.id as number,
			instructions: this.instructions,
			isPublic: this.isPublic,
			name: this.name,
			outputSchema: this.outputSchema,
			ownerId: this.ownerId as number,
			seedGlossary: this.seedGlossary,
			settings: this.settings,
			version: this.version,
		};
	}

	public toNewObject(): {
		description: string;
		familyId?: number;
		instructions: string;
		isPublic: boolean;
		name: string;
		outputSchema: Record<string, unknown>;
		ownerId: number;
		seedGlossary: SeedGlossary;
		settings: Record<string, unknown>;
		version: number;
	} {
		return {
			description: this.description,
			...(this.familyId === null ? {} : { familyId: this.familyId }),
			instructions: this.instructions,
			isPublic: this.isPublic,
			name: this.name,
			outputSchema: this.outputSchema,
			ownerId: this.ownerId as number,
			seedGlossary: this.seedGlossary,
			settings: this.settings,
			version: this.version,
		};
	}

	public toObject(): PresetGetAllItemResponseDto {
		return {
			description: this.description,
			familyId: this.familyId as number,
			id: this.id as number,
			name: this.name,
			version: this.version,
		};
	}
}

export { PresetEntity };
