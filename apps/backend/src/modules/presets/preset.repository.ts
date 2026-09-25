import { EMPTY_LENGTH } from "@transcripta/shared";
import { type Transaction } from "objection";

import { PresetEntity } from "./preset.entity.js";
import { type PresetModel } from "./preset.model.js";

class PresetRepository {
	private presetModel: typeof PresetModel;

	public constructor(presetModel: typeof PresetModel) {
		this.presetModel = presetModel;
	}

	public async create(
		entity: PresetEntity,
		trx?: Transaction,
	): Promise<PresetEntity> {
		const preset = await this.presetModel
			.query(trx)
			.insert(entity.toNewObject())
			.returning("*")
			.execute();

		return PresetEntity.initialize(preset);
	}

	public async findAccessibleBase(
		familyId: number,
		ownerId: number,
	): Promise<null | PresetEntity> {
		const preset = await this.presetModel
			.query()
			.where({ familyId })
			.andWhere((builder) => {
				builder.where("isPublic", true).orWhere("ownerId", ownerId);
			})
			.orderBy("version", "desc")
			.first()
			.execute();

		return preset ? PresetEntity.initialize(preset) : null;
	}

	public async findAllByUserId(userId: number): Promise<PresetEntity[]> {
		const presets = await this.presetModel
			.query()
			.select("id", "name", "description", "familyId", "version")
			.where((builder) => {
				builder.where("isPublic", true).orWhere("ownerId", userId);
			})
			.orderBy("id", "asc")
			.execute();

		return presets.map((preset) => PresetEntity.initialize(preset));
	}

	public async findFamilyMaxVersion(familyId: number): Promise<number> {
		const row = await this.presetModel
			.query()
			.where({ familyId })
			.select(
				this.presetModel.knex().raw("coalesce(max(version), 0) as max_version"),
			)
			.first();

		const maxVersion = (row as unknown as undefined | { maxVersion?: number })
			?.maxVersion;

		return Number(maxVersion ?? EMPTY_LENGTH);
	}
}

export { PresetRepository };
