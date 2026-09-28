import { type PresetGetAllItemResponseDto } from "@transcripta/shared";

import { DEFAULT_PRESET_ID } from "./default-preset-id.constant.js";

const DEFAULT_PRESET_FALLBACK: PresetGetAllItemResponseDto = {
	description: "",
	familyId: DEFAULT_PRESET_ID,
	id: DEFAULT_PRESET_ID,
	name: "Parish register, late 19th century",
	version: 1,
};

export { DEFAULT_PRESET_FALLBACK };
