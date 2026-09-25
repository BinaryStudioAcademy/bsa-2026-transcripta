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
			.distinctOn("familyId")
			.select("id", "name", "description")
			.where((builder) => {
				builder.where("isPublic", true).orWhere("ownerId", userId);
			})
			.orderBy([
				{ column: "familyId", order: "asc" },
				{ column: "version", order: "desc" },
			])
			.execute();

		return presets
			.toSorted((firstPreset, secondPreset) => firstPreset.id - secondPreset.id)
			.map((preset) => PresetEntity.initialize(preset));
	}
}

export { PresetRepository };
