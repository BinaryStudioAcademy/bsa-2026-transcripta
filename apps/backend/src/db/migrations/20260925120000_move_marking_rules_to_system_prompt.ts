import { type Knex } from "knex";

const TABLE_NAME = "preset";
const TRIGGER_NAME = "preset_immutable";
const PAGE_TEXT_KEY = "page_text";

const MARKER_RULE =
	"\n- Mark the illegible as [?] and the completely lost as [...].";

// The seeded line that directly follows MARKER_RULE; down() re-inserts the
// marker rule in front of it to restore the original text exactly.
const LINE_AFTER_MARKER_RULE =
	"\n- Keep dates exactly as written, do not convert the calendar.";
const PAGE_TEXT_RULE =
	"\n- Put the whole page as continuous readable text in the page_text field, keeping the original line order. Where the page holds a table, write that part as a Markdown pipe table with a header row, and keep the surrounding prose as plain paragraphs. Where you can read a word but are not confident it is right, write your best reading followed by (?), for example Ferrers(?). The structured records describe the same page, they do not replace it.";

const withTriggerDisabled = async (
	knex: Knex,
	callback: () => Promise<void>,
): Promise<void> => {
	await knex.raw(`ALTER TABLE ${TABLE_NAME} DISABLE TRIGGER ${TRIGGER_NAME}`);

	try {
		await callback();
	} finally {
		await knex.raw(`ALTER TABLE ${TABLE_NAME} ENABLE TRIGGER ${TRIGGER_NAME}`);
	}
};

async function down(knex: Knex): Promise<void> {
	await withTriggerDisabled(knex, async () => {
		await knex(TABLE_NAME)
			.whereRaw("position(? in instructions) > 0", [LINE_AFTER_MARKER_RULE])
			.whereRaw("position(? in instructions) = 0", [MARKER_RULE])
			.update({
				instructions: knex.raw("replace(instructions, ?, ?)", [
					LINE_AFTER_MARKER_RULE,
					`${MARKER_RULE}${LINE_AFTER_MARKER_RULE}`,
				]),
			});

		await knex(TABLE_NAME)
			.whereRaw("output_schema -> 'properties' ->> ? is not null", [
				PAGE_TEXT_KEY,
			])
			.whereRaw("position(? in instructions) = 0", [PAGE_TEXT_RULE])
			.update({
				instructions: knex.raw("instructions || ?", [PAGE_TEXT_RULE]),
			});
	});
}

async function up(knex: Knex): Promise<void> {
	await withTriggerDisabled(knex, async () => {
		await knex(TABLE_NAME)
			.whereRaw("position(? in instructions) > 0", [MARKER_RULE])
			.update({
				instructions: knex.raw("replace(instructions, ?, '')", [MARKER_RULE]),
			});

		await knex(TABLE_NAME)
			.whereRaw("position(? in instructions) > 0", [PAGE_TEXT_RULE])
			.update({
				instructions: knex.raw("replace(instructions, ?, '')", [
					PAGE_TEXT_RULE,
				]),
			});
	});
}

export { down, up };
