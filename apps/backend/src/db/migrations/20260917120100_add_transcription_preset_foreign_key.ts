import { type Knex } from "knex";

const TABLE_NAME = "transcription";
const DOCUMENT_TABLE_NAME = "document";
const PRESET_TABLE_NAME = "preset";

const ColumnName = {
	DOCUMENT_ID: "document_id",
	ID: "id",
	PRESET_ID: "preset_id",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropForeign([ColumnName.PRESET_ID]);
		table.integer(ColumnName.PRESET_ID).nullable().alter();
	});
}

async function up(knex: Knex): Promise<void> {
	const invalidTranscription = await knex(TABLE_NAME)
		.select(`${TABLE_NAME}.${ColumnName.ID}`)
		.leftJoin(
			PRESET_TABLE_NAME,
			`${TABLE_NAME}.${ColumnName.PRESET_ID}`,
			`${PRESET_TABLE_NAME}.${ColumnName.ID}`,
		)
		.whereNotNull(`${TABLE_NAME}.${ColumnName.PRESET_ID}`)
		.whereNull(`${PRESET_TABLE_NAME}.${ColumnName.ID}`)
		.first<undefined | { id: number }>();

	if (invalidTranscription) {
		throw new Error(
			`Transcription ${String(invalidTranscription.id)} references a missing preset`,
		);
	}

	await knex(TABLE_NAME)
		.update({
			[ColumnName.PRESET_ID]: knex.ref(
				`${DOCUMENT_TABLE_NAME}.${ColumnName.PRESET_ID}`,
			),
		})
		.updateFrom(DOCUMENT_TABLE_NAME)
		.where(
			`${TABLE_NAME}.${ColumnName.DOCUMENT_ID}`,
			knex.ref(`${DOCUMENT_TABLE_NAME}.${ColumnName.ID}`),
		)
		.whereNull(`${TABLE_NAME}.${ColumnName.PRESET_ID}`);

	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table
			.integer(ColumnName.PRESET_ID)
			.notNullable()
			.references(ColumnName.ID)
			.inTable(PRESET_TABLE_NAME)
			.alter();
	});
}

export { down, up };
