import { sha256 } from "~/context/libs/helpers/hash.helper.js";

type CacheKeyParts = {
	contextHash: string;
	imageSha256: string;
	modelId: string;
	presetId: number;
};

/**
 * Cache key: hash of (image_sha256 + preset + model + context). A hit means
 * the same scan with the same context and model is reused free of charge
 * (docs/02-data-pipeline.md). `imageSha256` already covers the image content,
 * `contextHash` covers the assembled context, and the exact model id prevents
 * a bare-id/alias mismatch from serving a wrong answer.
 */
const buildCacheKey = ({
	contextHash,
	imageSha256,
	modelId,
	presetId,
}: CacheKeyParts): string =>
	sha256([imageSha256, String(presetId), modelId, contextHash].join("|"));

export { buildCacheKey };
