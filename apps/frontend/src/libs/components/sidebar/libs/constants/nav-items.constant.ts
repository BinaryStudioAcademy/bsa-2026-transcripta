import { AppRoute } from "~/libs/enums/enums.js";

const NAV_ITEMS = [
	{ label: "Documents", route: AppRoute.DOCUMENTS },
	{ label: "Presets", route: AppRoute.PRESETS },
] as const;

export { NAV_ITEMS };
