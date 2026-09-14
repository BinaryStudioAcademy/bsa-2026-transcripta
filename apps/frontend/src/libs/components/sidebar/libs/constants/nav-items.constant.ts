import { AppRoute } from "~/libs/enums/enums.js";

import { DocumentIcon, PresetsIcon } from "../components/icons.js";

const NAV_ITEMS = [
	{ icon: DocumentIcon, label: "Documents", route: AppRoute.DOCUMENTS },
	{ icon: PresetsIcon, label: "Presets", route: AppRoute.PRESETS },
] as const;

export { NAV_ITEMS };
