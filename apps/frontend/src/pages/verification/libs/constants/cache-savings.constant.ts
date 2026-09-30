const CACHE_SAVINGS_LABEL_PREFIX = "saved";

// The cache is shared across accounts, so the copy says what happened and
// nothing about who paid for the original call. No "another user", no "already
// uploaded", no document identity — only that no model call was made.
const CACHE_SAVINGS_TIP =
	"This page came from the shared cache, so no model call was made for it.";

// A cached page on a cheap model is a fraction of a cent, and the budget
// figures next to it are rounded to cents, so four decimals is the point where
// a real saving is still legible without a row of trailing zeros.
const SAVED_USD_DECIMALS = 4;

export { CACHE_SAVINGS_LABEL_PREFIX, CACHE_SAVINGS_TIP, SAVED_USD_DECIMALS };
