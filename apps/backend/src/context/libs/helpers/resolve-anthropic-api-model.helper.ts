import {
	ANTHROPIC_DIRECT_PREFIX,
	ANTHROPIC_ID_MARKER,
	NOT_FOUND_INDEX,
} from "../constants/constants.js";

const resolveAnthropicApiModel = (model: string): string => {
	if (model.startsWith(ANTHROPIC_DIRECT_PREFIX)) {
		return model.slice(ANTHROPIC_DIRECT_PREFIX.length);
	}

	const markerIndex = model.indexOf(ANTHROPIC_ID_MARKER);

	if (markerIndex === NOT_FOUND_INDEX) {
		return model;
	}

	return model.slice(markerIndex + ANTHROPIC_ID_MARKER.length);
};

export { resolveAnthropicApiModel };
