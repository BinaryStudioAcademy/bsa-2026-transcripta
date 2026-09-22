import { DocumentGetPagesItemResponseDto } from "@transcripta/shared";

import { Button } from "~/libs/components/components.js";
import { useCallback } from "~/libs/hooks/hooks.js";

import { getPageStripStatus } from "../helpers/get-page-strip-status.helper.js";

type PageButtonProperties = {
	isCurrent: boolean;
	onPageSelect: (pageNo: number) => void;
	page: DocumentGetPagesItemResponseDto;
};

const PageButton: React.FC<PageButtonProperties> = ({
	isCurrent,
	onPageSelect,
	page,
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

	const status = getPageStripStatus(page.status, isCurrent);

	const handleClick = useCallback((): void => {
		onPageSelect(page.pageNo);
	}, [page, onPageSelect]);

	return (
		<Button
			className={`tx-page tx-page--${status}`}
			onClick={handleClick}
			type="button"
		>
			{page.pageNo}
			<span aria-hidden="true" className="tx-status-icon">
				{statusSymbolMap[status]}
			</span>

			{!isCurrent && <span aria-hidden="true" className="tx-page-thumb" />}
		</Button>
	);
};

export { PageButton };
