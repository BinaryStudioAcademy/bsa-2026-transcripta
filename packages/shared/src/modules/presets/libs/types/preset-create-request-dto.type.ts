type PresetCreateRequestDto = {
	description?: string;
	familyId: number;
	instructions: string;
	name: string;
	seedGlossary?: Record<string, unknown>[] | string[];
	settings?: Record<string, unknown>;
};

export { type PresetCreateRequestDto };
