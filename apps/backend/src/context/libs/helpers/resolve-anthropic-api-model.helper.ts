import {
	ANTHROPIC_DIRECT_PREFIX,
	ANTHROPIC_ID_MARKER,
	BEDROCK_ANTHROPIC_VERSION_SUFFIX,
	NOT_FOUND_INDEX,
} from "../constants/constants.js";

const resolveAnthropicApiModel = (model: string): string => {
	let apiModel = model;

	if (model.startsWith(ANTHROPIC_DIRECT_PREFIX)) {
		apiModel = model.slice(ANTHROPIC_DIRECT_PREFIX.length);
	} else {
		const markerIndex = model.indexOf(ANTHROPIC_ID_MARKER);

		if (markerIndex !== NOT_FOUND_INDEX) {
			apiModel = model.slice(markerIndex + ANTHROPIC_ID_MARKER.length);
		}
	}

	return apiModel.replace(BEDROCK_ANTHROPIC_VERSION_SUFFIX, "");
};

export { resolveAnthropicApiModel };
