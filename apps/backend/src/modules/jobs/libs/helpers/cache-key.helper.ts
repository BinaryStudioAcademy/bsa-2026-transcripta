import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";
import { SYSTEM_PROMPT } from "~/modules/transcription/libs/constants/constants.js";

import { CACHE_KEY_SEPARATOR } from "../constants/constants.js";
import { type CacheKeyParts } from "../types/types.js";

const SYSTEM_PROMPT_HASH = sha256(SYSTEM_PROMPT);

const buildCacheKey = ({
	contextHash,
	imageSha256,
	modelId,
	presetHash,
}: CacheKeyParts): string =>
	sha256(
		[imageSha256, presetHash, modelId, contextHash, SYSTEM_PROMPT_HASH].join(
			CACHE_KEY_SEPARATOR,
		),
	);

export { buildCacheKey };
