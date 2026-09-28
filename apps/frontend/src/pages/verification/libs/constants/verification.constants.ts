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
const MIN_TABLE_LINES = 2;
const TABLE_CELL_SEPARATOR = "|";
const ILLEGIBLE_MARKER = "[?]";
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
const UNREADABLE_TIP = {
	ILLEGIBLE: "could not be read",
	LOST: "missing on the page",
	UNCERTAIN: "check this word",
} as const;

export {
	CURSOR_SYMBOL,
	ILLEGIBLE_MARKER,
	INITIAL_SPLIT_POSITION,
	INITIAL_ZOOM,
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
	TABLE_CELL_SEPARATOR,
	TOGGLE_ZOOM_LEVEL,
	UNREADABLE_TIP,
	WHEEL_DELTA_THRESHOLD,
	ZOOM_IN_DIRECTION,
	ZOOM_OUT_DIRECTION,
	ZOOM_PAN_RESET,
	ZOOM_STEP,
};
