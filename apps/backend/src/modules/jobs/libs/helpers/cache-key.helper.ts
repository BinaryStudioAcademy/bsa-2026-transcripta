import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";

import { CACHE_KEY_SEPARATOR } from "../constants/constants.js";
import { type CacheKeyParts } from "../types/types.js";

const buildCacheKey = ({
	contextHash,
	imageSha256,
	modelId,
	presetHash,
}: CacheKeyParts): string =>
	sha256(
		[imageSha256, presetHash, modelId, contextHash].join(CACHE_KEY_SEPARATOR),
	);

export { buildCacheKey };
