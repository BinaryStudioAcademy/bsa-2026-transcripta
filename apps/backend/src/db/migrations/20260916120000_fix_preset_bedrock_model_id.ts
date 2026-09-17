import { ModelId } from "@transcripta/shared";
import { type Knex } from "knex";

const TABLE_NAME = "preset";
const TRIGGER_NAME = "preset_immutable";
const INVALID_MODEL = "claude-opus-5";

/**
 * The seeded preset carried "claude-opus-5", which is an Anthropic API model id
 * and not a Bedrock inference profile, so every model call failed with
 * ValidationException. Presets are immutable by design, so the trigger is
 * lifted for this one repair of seeded data.
 */
const repairModel = async (
	knex: Knex,
	from: string,
	to: string,
): Promise<void> => {
	await knex.raw(`ALTER TABLE ${TABLE_NAME} DISABLE TRIGGER ${TRIGGER_NAME}`);

	try {
		await knex(TABLE_NAME)
			.whereRaw("settings ->> 'model' = ?", [from])
			.update({
				settings: knex.raw("jsonb_set(settings, '{model}', ?::jsonb)", [
					JSON.stringify(to),
				]),
			});
	} finally {
		await knex.raw(`ALTER TABLE ${TABLE_NAME} ENABLE TRIGGER ${TRIGGER_NAME}`);
	}
};

async function down(knex: Knex): Promise<void> {
	await repairModel(knex, ModelId.CLAUDE_SONNET_4_6_BEDROCK, INVALID_MODEL);
}

async function up(knex: Knex): Promise<void> {
	await repairModel(knex, INVALID_MODEL, ModelId.CLAUDE_SONNET_4_6_BEDROCK);
}

export { down, up };
