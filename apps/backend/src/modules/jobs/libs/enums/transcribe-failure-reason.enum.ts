const TranscribeFailureReason = {
	BUDGET_EXCEEDED: "budget_exceeded",
	INVALID_MODEL_OUTPUT: "invalid_model_output",
	MODEL_CALL_FAILED: "model_call_failed",
	PAGE_IMAGE_MISSING: "page_image_missing",
	PAGE_IMAGE_SHA_MISSING: "page_image_sha_missing",
	PRESET_NOT_FOUND: "preset_not_found",
	UNEXPECTED_ERROR: "unexpected_error",
} as const;

export { TranscribeFailureReason };
