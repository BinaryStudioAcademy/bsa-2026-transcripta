import { PresetDetailsEntity } from "./preset-details.entity.js";
import { PresetEntity } from "./preset.entity.js";
import { type PresetModel } from "./preset.model.js";

class PresetRepository {
	private presetModel: typeof PresetModel;

	public constructor(presetModel: typeof PresetModel) {
		this.presetModel = presetModel;
	}

	public async findAllByUserId(userId: number): Promise<PresetEntity[]> {
		const presets = await this.presetModel
			.query()
			.select("id", "name", "description")
			.where((builder) => {
				builder.where("isPublic", true).orWhere("ownerId", userId);
			})
			.orderBy("id", "asc")
			.execute();

		return presets.map((preset) => PresetEntity.initialize(preset));
	}

	public async findByIdAndUserId(
		id: number,
		userId: number,
	): Promise<null | PresetDetailsEntity> {
		const preset = await this.presetModel
			.query()
			.select("id", "name", "instructions", "seedGlossary", "outputSchema")
			.where("id", id)
			.where((builder) => {
				builder.where("isPublic", true).orWhere("ownerId", userId);
			})
			.first()
			.execute();

		return preset ? PresetDetailsEntity.initialize(preset) : null;
	}
}

export { PresetRepository };
