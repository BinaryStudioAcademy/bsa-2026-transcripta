type PresetCreateResponseDto = {
	createdAt: string;
	description: string;
	familyId: number;
	id: number;
	instructions: string;
	isPublic: boolean;
	name: string;
	outputSchema: Record<string, unknown>;
	ownerId: number;
	seedGlossary: Record<string, unknown>[] | string[];
	settings: Record<string, unknown>;
	version: number;
};

export { type PresetCreateResponseDto };
