import { type Knex } from "knex";

const PRESET_FAMILY_SEQUENCE = "preset_family_seq";
const MIN_VERSION = 1;

const TableName = {
	PRESET: "preset",
	USERS: "users",
} as const;

const ColumnName = {
	CREATED_AT: "created_at",
	DESCRIPTION: "description",
	FAMILY_ID: "family_id",
	ID: "id",
	INSTRUCTIONS: "instructions",
	IS_PUBLIC: "is_public",
	NAME: "name",
	OUTPUT_SCHEMA: "output_schema",
	OWNER_ID: "owner_id",
	SEED_GLOSSARY: "seed_glossary",
	SETTINGS: "settings",
	UPDATED_AT: "updated_at",
	VERSION: "version",
} as const;

const IndexName = {
	FAMILY: "preset_family_idx",
	OWNER: "preset_owner_idx",
	PUBLIC: "preset_public_idx",
} as const;

const UsersColumnName = {
	ID: "id",
} as const;

async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists(TableName.PRESET);
	await knex.raw(`DROP SEQUENCE IF EXISTS ${PRESET_FAMILY_SEQUENCE}`);
}

async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		CREATE OR REPLACE FUNCTION forbid_update() RETURNS trigger
		LANGUAGE plpgsql AS $$
		BEGIN
			RAISE EXCEPTION '% table is not updatable, create a new row', TG_TABLE_NAME;
		END;
		$$;
	`);

	await knex.raw(`CREATE SEQUENCE IF NOT EXISTS ${PRESET_FAMILY_SEQUENCE}`);

	await knex.schema.createTable(TableName.PRESET, (table) => {
		table.increments(ColumnName.ID).primary();
		table
			.integer(ColumnName.FAMILY_ID)
			.notNullable()
			.defaultTo(knex.raw(`nextval('${PRESET_FAMILY_SEQUENCE}')`));
		table.integer(ColumnName.VERSION).notNullable().defaultTo(MIN_VERSION);
		table
			.integer(ColumnName.OWNER_ID)
			.nullable()
			.references(UsersColumnName.ID)
			.inTable(TableName.USERS);
		table.text(ColumnName.NAME).notNullable();
		table.text(ColumnName.DESCRIPTION).notNullable().defaultTo("");
		table.boolean(ColumnName.IS_PUBLIC).notNullable().defaultTo(false);
		table.text(ColumnName.INSTRUCTIONS).notNullable();
		table
			.jsonb(ColumnName.OUTPUT_SCHEMA)
			.notNullable()
			.defaultTo(knex.raw("'{}'::jsonb"));
		table
			.jsonb(ColumnName.SEED_GLOSSARY)
			.notNullable()
			.defaultTo(knex.raw("'[]'::jsonb"));
		table
			.jsonb(ColumnName.SETTINGS)
			.notNullable()
			.defaultTo(knex.raw("'{}'::jsonb"));
		table
			.timestamp(ColumnName.CREATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table
			.timestamp(ColumnName.UPDATED_AT, { useTz: true })
			.notNullable()
			.defaultTo(knex.fn.now());
		table.unique([ColumnName.FAMILY_ID, ColumnName.VERSION], {
			indexName: "preset_version_unique",
		});
		table.check("?? > 0", [ColumnName.VERSION], "preset_version_positive");
		table.index(ColumnName.OWNER_ID, IndexName.OWNER);
		table.index(ColumnName.IS_PUBLIC, IndexName.PUBLIC, {
			predicate: knex.whereRaw("is_public"),
		});
	});

	await knex.raw(
		`CREATE INDEX ${IndexName.FAMILY} ON ${TableName.PRESET} (${ColumnName.FAMILY_ID}, version DESC)`,
	);

	await knex.raw(`
		CREATE TRIGGER preset_immutable BEFORE UPDATE ON ${TableName.PRESET}
		FOR EACH ROW EXECUTE FUNCTION forbid_update();
	`);
}

export { down, up };
