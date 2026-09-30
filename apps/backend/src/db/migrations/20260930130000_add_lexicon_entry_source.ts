import { type Knex } from "knex";

const TABLE_NAME = "lexicon_entry";
const LEXICON_SOURCE_TYPE = "lexicon_source";

const ColumnName = {
	SOURCE: "source",
} as const;

const LexiconSource = {
	HUMAN: "human",
	MODEL: "model",
} as const;

const LexiconSourceValues = Object.values(LexiconSource);

async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table.dropColumn(ColumnName.SOURCE);
	});

	await knex.raw(`DROP TYPE IF EXISTS ${LEXICON_SOURCE_TYPE}`);
}

async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable(TABLE_NAME, (table) => {
		table
			.enu(ColumnName.SOURCE, [...LexiconSourceValues], {
				enumName: LEXICON_SOURCE_TYPE,
				useNative: true,
			})
			.notNullable()
			.defaultTo(LexiconSource.MODEL);
	});

	await knex.raw(`
		COMMENT ON COLUMN ${TABLE_NAME}.${ColumnName.SOURCE} IS 'Who produced the entry: the model, or a person verifying a page.'
	`);
}

export { down, up };
