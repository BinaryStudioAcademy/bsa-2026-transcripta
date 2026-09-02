import { type Knex } from "knex";

const TABLE_NAME = "document";
const PRESET_TABLE_NAME = "preset";

const ColumnName = {
	PRESET_ID: "preset_id",
} as const;

const PresetColumnName = {
	ID: "id",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropForeign([ColumnName.PRESET_ID]);
		table.integer(ColumnName.PRESET_ID).nullable().alter();
	});
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table
			.integer(ColumnName.PRESET_ID)
			.notNullable()
			.references(PresetColumnName.ID)
			.inTable(PRESET_TABLE_NAME)
			.alter();
	});
}

export { down, up };
