import { type PresetGetAllResponseDto } from "@transcripta/shared";

import { type PresetRepository } from "./preset.repository.js";

class PresetService {
	private presetRepository: PresetRepository;

	public constructor(presetRepository: PresetRepository) {
		this.presetRepository = presetRepository;
	}

	public async findAllByUserId(
		userId: number,
	): Promise<PresetGetAllResponseDto> {
		const items = await this.presetRepository.findAllByUserId(userId);

		return {
			items: items.map((item) => item.toObject()),
		};
	}
}

export { PresetService };
