type Properties = {
	currentLimitUsd: string;
	onCancel: () => void;
	onSubmit: (newLimit: string) => void;
	serverError?: null | string;
	spentUsd: string;
};

export { type Properties };
