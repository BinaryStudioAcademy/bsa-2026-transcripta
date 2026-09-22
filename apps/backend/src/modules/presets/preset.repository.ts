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
}

export { PresetRepository };
