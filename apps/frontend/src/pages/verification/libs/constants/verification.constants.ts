import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";
import { PageStatus } from "~/modules/pages/libs/enums/enums.js";

const PAGE_STEP = 1;
const MIN_NUMBER_OF_PAGES = 1;
const MAX_LOADED_PAGES = 5;
const MIN_SPLIT_POSITION = 25;
const MAX_SPLIT_POSITION = 75;
const INITIAL_SPLIT_POSITION = 50;
const INITIAL_ZOOM = 1;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const TOGGLE_ZOOM_LEVEL = 1.5;
const WHEEL_DELTA_THRESHOLD = 0;
const ZOOM_IN_DIRECTION = 1;
const ZOOM_OUT_DIRECTION = -1;
const ZOOM_PAN_RESET = 0;
const LEXICON_TIP = {
	PAGE: "page",
	PAGES: "pages",
	PREFIX: "from the lexicon, seen on",
} as const;
const MIN_TABLE_LINES = 2;
const TABLE_CELL_SEPARATOR = "|";
const ILLEGIBLE_MARKER = "[?]";
const UNCERTAIN_SUFFIX = "(?)";
const MARKED_WORDS_LABEL = "Marked words";
const CURSOR_SYMBOL = "●";
const PAGE_STATUS_SYMBOL: Record<string, string> = {
	blank: "✓",
	confirmed: "✓",
	corrected: "✎",
	error: "!",
	queued: "·",
	ready: "▓",
	running: "░",
	skipped: "↷",
};
const PAGE_STRIP_LEGEND = [
	{ label: "cursor", symbol: CURSOR_SYMBOL },
	{ label: "ready", symbol: PAGE_STATUS_SYMBOL["ready"] },
	{ label: "running", symbol: PAGE_STATUS_SYMBOL["running"] },
	{ label: "queued", symbol: PAGE_STATUS_SYMBOL["queued"] },
	{ label: "confirmed", symbol: PAGE_STATUS_SYMBOL["confirmed"] },
	{ label: "corrected", symbol: PAGE_STATUS_SYMBOL["corrected"] },
	{ label: "skipped", symbol: PAGE_STATUS_SYMBOL["skipped"] },
	{ label: "failed", symbol: PAGE_STATUS_SYMBOL["error"] },
] as const;
const READING_PAGE_STATUSES: string[] = [
	PageStatus.PENDING,
	PageStatus.QUEUED,
	PageStatus.TRANSCRIBING,
];

// A page in one of these statuses will not change on its own, so polling it
// brings nothing back.
const SETTLED_PAGE_STATUSES: string[] = [
	PageStatus.BLANK,
	PageStatus.CONFIRMED,
	PageStatus.CORRECTED,
	PageStatus.FAILED,
	PageStatus.SKIPPED,
	PageStatus.TRANSCRIBED,
];

// While the document sits in one of these statuses no worker is running, so a
// pending page stays pending until the user resumes it.
const IDLE_DOCUMENT_STATUSES: string[] = [
	DocumentStatus.BUDGET_STOP,
	DocumentStatus.DONE,
	DocumentStatus.DRAFT,
	DocumentStatus.FAILED,
	DocumentStatus.PAUSED,
];

const UNREADABLE_TIP = {
	ILLEGIBLE: "could not be read",
	LOST: "missing on the page",
	UNCERTAIN: "check this word",
} as const;

export {
	CURSOR_SYMBOL,
	IDLE_DOCUMENT_STATUSES,
	ILLEGIBLE_MARKER,
	INITIAL_SPLIT_POSITION,
	INITIAL_ZOOM,
	LEXICON_TIP,
	MARKED_WORDS_LABEL,
	MAX_LOADED_PAGES,
	MAX_SPLIT_POSITION,
	MAX_ZOOM,
	MIN_NUMBER_OF_PAGES,
	MIN_SPLIT_POSITION,
	MIN_TABLE_LINES,
	MIN_ZOOM,
	PAGE_STATUS_SYMBOL,
	PAGE_STEP,
	PAGE_STRIP_LEGEND,
	READING_PAGE_STATUSES,
	SETTLED_PAGE_STATUSES,
	TABLE_CELL_SEPARATOR,
	TOGGLE_ZOOM_LEVEL,
	UNCERTAIN_SUFFIX,
	UNREADABLE_TIP,
	WHEEL_DELTA_THRESHOLD,
	ZOOM_IN_DIRECTION,
	ZOOM_OUT_DIRECTION,
	ZOOM_PAN_RESET,
	ZOOM_STEP,
};
