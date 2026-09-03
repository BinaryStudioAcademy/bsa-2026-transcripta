import { DocumentStatus, type ValueOf } from "@transcripta/shared";
import { Model, RelationMappings } from "objection";

import {
	AbstractModel,
	DatabaseTableName,
} from "~/libs/modules/database/database.js";

import { PresetModel } from "../presets/presets.js";

type DocumentStatusValue = ValueOf<typeof DocumentStatus>;

class DocumentModel extends AbstractModel {
	static readonly relationMappings: RelationMappings = {
		preset: {
			join: {
				from: `${DatabaseTableName.DOCUMENT}.preset_id`,
				to: `${DatabaseTableName.PRESET}.id`,
			},
			modelClass: PresetModel,
			relation: Model.BelongsToOneRelation,
		},
	};

	public budgetUsd!: string;

	public cursorPageNo!: number;

	public errorMessage!: null | string;

	public ownerId!: number;

	public pageCount!: number;

	public preset?: PresetModel;

	public presetId!: number;

	public sourceBytes!: null | number;

	public sourceKey!: null | string;

	public sourceName!: null | string;

	public spentUsd!: string;

	public status!: DocumentStatusValue;

	public title!: string;

	public static override get tableName(): string {
		return DatabaseTableName.DOCUMENT;
	}
}

export { DocumentModel };
