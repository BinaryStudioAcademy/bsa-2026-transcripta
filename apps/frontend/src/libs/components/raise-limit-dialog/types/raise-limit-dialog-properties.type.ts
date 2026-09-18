type Properties = {
	currentLimitUsd: string;
	onCancel: () => void;
	onSubmit: (newLimit: string) => void;
	spentUsd: string;
};

export { type Properties };
