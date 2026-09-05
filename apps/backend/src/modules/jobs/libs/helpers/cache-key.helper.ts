import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";

type CacheKeyParts = {
	contextHash: string;
	imageSha256: string;
	modelId: string;
	presetId: number;
};

const buildCacheKey = ({
	contextHash,
	imageSha256,
	modelId,
	presetId,
}: CacheKeyParts): string =>
	sha256([imageSha256, String(presetId), modelId, contextHash].join("|"));

export { buildCacheKey };
