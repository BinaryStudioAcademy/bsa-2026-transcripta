type PresetGetByIdResponseDto = {
	familyId: number;
	id: number;
	instructions: string;
	name: string;
	outputSchema: Record<string, unknown>;
	seedGlossary: Record<string, unknown>[] | string[];
};

export { type PresetGetByIdResponseDto };
