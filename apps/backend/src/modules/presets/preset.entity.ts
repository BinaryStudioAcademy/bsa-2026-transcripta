import { type PresetGetAllItemResponseDto } from "@transcripta/shared";

import { type Entity } from "~/libs/types/types.js";

class PresetEntity implements Entity {
	private description: string;

	private id: null | number;

	private name: string;

	private constructor({
		description,
		id,
		name,
	}: {
		description: string;
		id: null | number;
		name: string;
	}) {
		this.description = description;
		this.id = id;
		this.name = name;
	}

	public static initialize({
		description,
		id,
		name,
	}: {
		description: string;
		id: number;
		name: string;
	}): PresetEntity {
		return new PresetEntity({
			description,
			id,
			name,
		});
	}

	public static initializeNew({
		description,
		name,
	}: {
		description: string;
		name: string;
	}): PresetEntity {
		return new PresetEntity({
			description,
			id: null,
			name,
		});
	}

	public toNewObject(): {
		description: string;
		name: string;
	} {
		return {
			description: this.description,
			name: this.name,
		};
	}

	public toObject(): PresetGetAllItemResponseDto {
		return {
			description: this.description,
			id: this.id as number,
			name: this.name,
		};
	}
}

export { PresetEntity };
