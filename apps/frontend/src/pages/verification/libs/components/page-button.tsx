import { DocumentGetPagesItemResponseDto } from "@transcripta/shared";

import { Button } from "~/libs/components/components.js";
import { useCallback } from "~/libs/hooks/hooks.js";

import { getPageStripStatus } from "../helpers/get-page-strip-status.helper.js";

type PageButtonProperties = {
	isCurrent: boolean;
	isCursor: boolean;
	onPageSelect: (pageNo: number) => void;
	page: DocumentGetPagesItemResponseDto;
};

const statusSymbolMap: Record<string, string> = {
	blank: "✓",
	confirmed: "✓",
	corrected: "✎",
	error: "!",
	queued: "·",
	ready: "▓",
	running: "░",
	skipped: "↷",
};

const CURSOR_SYMBOL = "●";

const PageButton: React.FC<PageButtonProperties> = ({
	isCurrent,
	isCursor,
	onPageSelect,
	page,
}) => {
	const status = getPageStripStatus(page.status);

	const className = [
		"tx-page",
		`tx-page--${status}`,
		isCursor && "tx-page--cursor",
		isCurrent && "tx-page--current",
	]
		.filter(Boolean)
		.join(" ");

	const handleClick = useCallback((): void => {
		onPageSelect(page.pageNo);
	}, [page, onPageSelect]);

	return (
		<Button className={className} onClick={handleClick} type="button">
			{page.pageNo}
			{isCursor && (
				<span aria-hidden="true" className="tx-cursor-icon">
					{CURSOR_SYMBOL}
				</span>
			)}
			<span aria-hidden="true" className="tx-status-icon">
				{statusSymbolMap[status]}
			</span>

			{!isCurrent && <span aria-hidden="true" className="tx-page-thumb" />}
		</Button>
	);
};

export { PageButton };
