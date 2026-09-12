type PageButtonProperties = {
	isCurrent: boolean;
	page: number | undefined;
	status: string;
};

const PageButton: React.FC<PageButtonProperties> = ({
	isCurrent,
	page,
	status,
}) => {
	const statusSymbolMap: Record<string, string> = {
		confirmed: "✓",
		corrected: "✎",
		current: "●",
		error: "!",
		queued: "·",
		ready: "▓",
		running: "░",
		skipped: "↷",
	};

	return (
		<button className={`tx-page tx-page--${status}`} type="button">
			{page}
			<span aria-hidden="true">{statusSymbolMap[status]}</span>

			{!isCurrent && <span aria-hidden="true" className="tx-page-thumb" />}
		</button>
	);
};

export { PageButton };
