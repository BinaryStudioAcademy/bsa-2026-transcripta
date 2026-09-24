const InfoMessage = {
	JOB_SKIPPED_AFTER_MODEL: (pageId: number) =>
		`Skipped rederive structured after model call: edited_structured for pageId ${pageId.toString()} was already updated by a newer job`,
	JOB_SKIPPED_BEFORE_MODEL: (pageId: number) =>
		`Skipped rederive structured before model call: edited_structured for pageId ${pageId.toString()} was already updated by a newer job`,
} as const;

export { InfoMessage };
