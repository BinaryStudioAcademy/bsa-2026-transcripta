import { AppRoute } from "~/libs/enums/enums.js";

const NAV_ITEMS = [
	{ label: "Documents", route: AppRoute.DOCUMENTS },
	{ label: "Presets", route: AppRoute.PRESETS },
] as const;

const PLACEHOLDER_EMAIL = "reader@example.com";

export { NAV_ITEMS, PLACEHOLDER_EMAIL };
