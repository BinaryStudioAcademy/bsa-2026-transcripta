import { type Knex } from "knex";

const TABLE_NAME = "document";
const PRESET_TABLE_NAME = "preset";
const DEFAULT_PRESET_ID = 1;

const ColumnName = {
	ID: "id",
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
	const invalidDocument = await knex(TABLE_NAME)
		.select(`${TABLE_NAME}.${ColumnName.ID}`)
		.leftJoin(
			PRESET_TABLE_NAME,
			`${TABLE_NAME}.${ColumnName.PRESET_ID}`,
			`${PRESET_TABLE_NAME}.${PresetColumnName.ID}`,
		)
		.whereNotNull(`${TABLE_NAME}.${ColumnName.PRESET_ID}`)
		.whereNull(`${PRESET_TABLE_NAME}.${PresetColumnName.ID}`)
		.first<{ id: number }>();

	if (invalidDocument) {
		throw new Error(
			`Document ${String(invalidDocument.id)} references a missing preset`,
		);
	}

	await knex(TABLE_NAME)
		.whereNull(ColumnName.PRESET_ID)
		.update({ [ColumnName.PRESET_ID]: DEFAULT_PRESET_ID });

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
