import { EMPTY_LENGTH, PageStatus } from "@transcripta/shared";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";
import { PageModel } from "~/modules/pages/page.model.js";

import { TOKENS_PER_CHARACTER } from "./libs/constants/constants.js";
import { DEFAULT_SETTINGS } from "./libs/enums/enums.js";
import {
	type BuildContextOptions,
	type BuiltContext,
	type ContextSettings,
	type LexiconRow,
	type LexiconWord,
	type NeighbourPage,
	type Preset,
} from "./libs/types/types.js";

const CONTEXT_ELIGIBLE = [PageStatus.CONFIRMED, PageStatus.CORRECTED];

const LEXICON_HEADER = "Words already seen in this document:";
const NEIGHBOURS_HEADER = "Text of previous pages:";

const readSettings = (preset: Preset): ContextSettings => {
	const settings = preset.settings ?? {};

	return {
		lexiconTopK: Number(
			settings["lexiconTopK"] ?? DEFAULT_SETTINGS.lexiconTopK,
		),
		maxContextTokens: Number(
			settings["maxContextTokens"] ?? DEFAULT_SETTINGS.maxContextTokens,
		),
		minDistinctPages: Number(
			settings["minDistinctPages"] ?? DEFAULT_SETTINGS.minDistinctPages,
		),
		neighbourPages: Number(
			settings["neighbourPages"] ?? DEFAULT_SETTINGS.neighbourPages,
		),
	};
};

const renderSeedGlossary = (preset: Preset): string => {
	const glossary = preset.seedGlossary ?? [];

	if (glossary.length === EMPTY_LENGTH) {
		return "";
	}

	const lines = glossary.map((entry) => {
		if (typeof entry === "string") {
			return entry;
		}

		const value = entry["value"];
		const note = entry["note"];

		if (typeof value !== "string") {
			return "";
		}

		return typeof note === "string" ? `${value} (${note})` : value;
	});

	return `<seed>${lines.join("\n")}</seed>`;
};

const renderLexiconWord = (word: LexiconWord): string =>
	`${word.valueDisplay} (${String(word.distinctPages)} pages)`;

const renderNeighbourPage = (page: NeighbourPage): string =>
	`[page ${String(page.pageNo)}]\n${page.text}`;

const estimateTokens = (text: string): number =>
	Math.round(text.length / TOKENS_PER_CHARACTER);

const buildContext = async ({
	documentId,
	knex,
	logger,
	pageNo,
	preset,
}: BuildContextOptions): Promise<BuiltContext> => {
	const settings = readSettings(preset);

	const fixedBlocks: string[] = [];

	const seedBlock = renderSeedGlossary(preset);
	if (seedBlock) {
		fixedBlocks.push(seedBlock);
	}

	let lexicon: LexiconWord[] = [];

	try {
		const lexiconRows = (await knex
			.from(DatabaseTableName.LEXICON_ENTRY)
			.select("id", "value_display", "distinct_pages")
			.where("document_id", documentId)
			.whereNull("invalidated_at")
			.where("distinct_pages", ">=", settings.minDistinctPages)
			.orderBy([
				{ column: "distinct_pages", order: "desc" },
				{ column: "freq", order: "desc" },
			])
			.limit(settings.lexiconTopK)) as LexiconRow[];

		lexicon = lexiconRows.map((row) => ({
			distinctPages: row.distinct_pages,
			id: row.id,
			valueDisplay: row.value_display,
		}));
	} catch (error) {
		logger.warn("Lexicon query failed, transcribing without lexicon", {
			documentId,
			error: error instanceof Error ? error.message : String(error),
		});
		lexicon = [];
	}

	const neighbourPages = await PageModel.query()
		.where("documentId", documentId)
		.where("pageNo", "<", pageNo)
		.whereIn("status", CONTEXT_ELIGIBLE)
		.orderBy("pageNo", "desc")
		.limit(settings.neighbourPages)
		.execute();

	const neighbours: NeighbourPage[] = await Promise.all(
		neighbourPages.map(async (page) => {
			const transcription = await knex
				.from(DatabaseTableName.TRANSCRIPTION)
				.select<{ text: string }>("text")
				.where("page_id", page.id)
				.where("is_current", true)
				.first();

			return {
				id: page.id,
				pageNo: page.pageNo,
				text: transcription?.text ?? "",
			};
		}),
	);

	const eligibleNeighbours = neighbours.filter((n) => n.text);

	const neighbourSections = eligibleNeighbours.map((page) => ({
		id: page.id,
		text: renderNeighbourPage(page),
	}));
	const lexiconLines = lexicon.map((word) => ({
		id: word.id,
		text: renderLexiconWord(word),
	}));

	const trimmedLexicon = [...lexiconLines];
	const trimmedNeighbours = [...neighbourSections];

	const currentEstimate = (): number => {
		let text = fixedBlocks.join("\n");
		if (trimmedNeighbours.length > EMPTY_LENGTH) {
			text += `\n${NEIGHBOURS_HEADER}\n${trimmedNeighbours
				.map((s) => s.text)
				.join("\n\n")}`;
		}
		if (trimmedLexicon.length > EMPTY_LENGTH) {
			text += `\n${LEXICON_HEADER}\n${trimmedLexicon
				.map((l) => l.text)
				.join("\n")}`;
		}
		return Math.round(text.length / TOKENS_PER_CHARACTER);
	};

	while (
		currentEstimate() > settings.maxContextTokens &&
		(trimmedLexicon.length > EMPTY_LENGTH ||
			trimmedNeighbours.length > EMPTY_LENGTH)
	) {
		if (trimmedLexicon.length > EMPTY_LENGTH) {
			trimmedLexicon.pop();
		} else {
			trimmedNeighbours.pop();
		}
	}

	const blocks: string[] = [...fixedBlocks];

	let usedLexiconIds: number[] = [];
	let usedPageIds: number[] = [];

	if (trimmedNeighbours.length > EMPTY_LENGTH) {
		blocks.push(
			[NEIGHBOURS_HEADER, ...trimmedNeighbours.map((s) => s.text)].join("\n\n"),
		);
		usedPageIds = trimmedNeighbours.map((s) => s.id);
	}

	if (trimmedLexicon.length > EMPTY_LENGTH) {
		blocks.push(
			[LEXICON_HEADER, ...trimmedLexicon.map((l) => l.text)].join("\n"),
		);
		usedLexiconIds = trimmedLexicon.map((l) => l.id);
	}

	return {
		blocks,
		contextHash: sha256(blocks.join("\n")),
		tokenEstimate: estimateTokens(blocks.join("\n")),
		usedLexiconIds,
		usedPageIds,
	};
};

export { buildContext };
