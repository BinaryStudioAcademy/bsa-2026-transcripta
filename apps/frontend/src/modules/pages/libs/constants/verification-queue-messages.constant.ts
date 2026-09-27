const VerificationQueueMessage = {
	CONFLICT:
		"The verification could not be completed. The latest page version has been loaded.",
	DISCARDED: "These actions were not applied:",
} as const;

export { VerificationQueueMessage };
