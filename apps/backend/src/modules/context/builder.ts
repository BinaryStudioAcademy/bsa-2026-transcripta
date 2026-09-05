import { PageStatus } from "@transcripta/shared";
import { type Knex } from "knex";

import { DatabaseTableName } from "~/libs/modules/database/database.js";
import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";
import { PageModel } from "~/modules/pages/page.model.js";

import {
	type BuiltContext,
	type ContextSettings,
	type LexiconWord,
	type NeighbourPage,
	type Preset,
} from "./libs/types/types.js";

const CONTEXT_ELIGIBLE = [PageStatus.CONFIRMED, PageStatus.CORRECTED];

const DEFAULT_SETTINGS: ContextSettings = {
	lexiconTopK: 100,
	maxContextTokens: 6000,
	minDistinctPages: 2,
	neighbourPages: 3,
};

type BuildContextOptions = {
	documentId: number;
	knex: Knex;
	pageNo: number;
	preset: Preset;
};

type LexiconRow = {
	distinct_pages: number;
	id: number;
	value_display: string;
};

const ZERO = 0;

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

	if (glossary.length === ZERO) {
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

const renderLexicon = (words: LexiconWord[]): string => {
	if (words.length === ZERO) {
		return "";
	}

	const lines = words.map(
		(word) => `${word.valueDisplay} (${String(word.distinctPages)} pages)`,
	);

	return `Words already seen in this document:\n${lines.join("\n")}`;
};

const renderNeighbours = (pages: NeighbourPage[]): string => {
	if (pages.length === ZERO) {
		return "";
	}

	const lines = pages.map(
		(page) => `[page ${String(page.pageNo)}]\n${page.text}`,
	);

	return `Text of previous pages:\n${lines.join("\n\n")}`;
};

const TOKENS_PER_CHARACTER = 4;

const estimateTokens = (blocks: string[]): number =>
	Math.round(blocks.join("\n").length / TOKENS_PER_CHARACTER);

const fitToBudget = (
	blocks: string[],
	blocksByPriority: string[][],
	maxTokens: number,
): string[] => {
	if (estimateTokens(blocks) <= maxTokens) {
		return blocks;
	}

	const priorityFitted: string[][] = [];

	for (const tier of blocksByPriority) {
		const tierBlock = tier.join("\n");
		const remaining = maxTokens - estimateTokens(priorityFitted.flat());

		if (estimateTokens([tierBlock]) <= remaining) {
			priorityFitted.push(tier);
		}
	}

	return priorityFitted.flat();
};

const buildContext = async ({
	documentId,
	knex,
	pageNo,
	preset,
}: BuildContextOptions): Promise<BuiltContext> => {
	const settings = readSettings(preset);

	const priorityTiers: string[][] = [];

	const instructionsBlock = preset.instructions;
	if (instructionsBlock) {
		priorityTiers.push([instructionsBlock]);
	}

	const seedBlock = renderSeedGlossary(preset);
	if (seedBlock) {
		priorityTiers.push([seedBlock]);
	}

	let lexicon: LexiconWord[] = [];
	let lexiconBlock = "";

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

		lexiconBlock = renderLexicon(lexicon);
	} catch {
		lexicon = [];
		lexiconBlock = "";
	}

	if (lexiconBlock) {
		priorityTiers.push([lexiconBlock]);
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

	const neighboursBlock = renderNeighbours(neighbours.filter((n) => n.text));
	if (neighboursBlock) {
		priorityTiers.push([neighboursBlock]);
	}

	const blocks = fitToBudget(
		priorityTiers.flat(),
		priorityTiers,
		settings.maxContextTokens,
	);

	return {
		blocks,
		contextHash: sha256(blocks.join("\n")),
		tokenEstimate: estimateTokens(blocks),
		usedLexiconIds: lexicon.map((word) => word.id),
		usedPageIds: neighbours.map((page) => page.id),
	};
};

export { buildContext };
