import {
	HTTPCode,
	HTTPError,
	type PresetGetAllResponseDto,
	type PresetGetByIdResponseDto,
	PresetValidationMessage,
} from "@transcripta/shared";

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

	public async findById(
		id: number,
		userId: number,
	): Promise<PresetGetByIdResponseDto> {
		const preset = await this.presetRepository.findByIdAndUserId(id, userId);

		if (preset === null) {
			throw new HTTPError({
				message: PresetValidationMessage.PRESET_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		return preset.toObject();
	}
}

export { PresetService };
