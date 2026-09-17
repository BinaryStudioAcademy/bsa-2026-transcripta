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

	await knex.raw(`
		UPDATE ${TABLE_NAME}
		SET ${ColumnName.PRESET_ID} = ${DOCUMENT_TABLE_NAME}.${ColumnName.PRESET_ID}
		FROM ${DOCUMENT_TABLE_NAME}
		WHERE ${TABLE_NAME}.${ColumnName.DOCUMENT_ID} = ${DOCUMENT_TABLE_NAME}.${ColumnName.ID}
			AND ${TABLE_NAME}.${ColumnName.PRESET_ID} IS NULL
	`);

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
