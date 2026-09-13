import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";

import { type PresetHashParts } from "../types/types.js";

const buildPresetHash = ({
	id,
	instructions,
	outputSchema,
	seedGlossary,
	settings,
}: PresetHashParts): string =>
	sha256(
		JSON.stringify({
			id,
			instructions,
			outputSchema,
			seedGlossary,
			settings,
		}),
	);

export { buildPresetHash };
