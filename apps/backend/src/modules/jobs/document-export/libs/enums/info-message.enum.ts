const InfoMessage = {
	EXPORT_FINISHED: (exportId: number) =>
		`Document export ${exportId.toString()} completed successfully.`,
} as const;

export { InfoMessage };
