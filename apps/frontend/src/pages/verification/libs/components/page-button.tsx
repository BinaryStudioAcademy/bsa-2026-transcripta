import { DocumentGetPagesItemResponseDto } from "@transcripta/shared";

import { Button } from "~/libs/components/components.js";
import { useCallback } from "~/libs/hooks/hooks.js";

import {
	CURSOR_SYMBOL,
	PAGE_STATUS_SYMBOL,
} from "../constants/verification.constants.js";
import { getPageStripStatus } from "../helpers/get-page-strip-status.helper.js";

type PageButtonProperties = {
	isCurrent: boolean;
	isCursor: boolean;
	onPageSelect: (pageNo: number) => void;
	page: DocumentGetPagesItemResponseDto;
};

const PageButton: React.FC<PageButtonProperties> = ({
	isCurrent,
	isCursor,
	onPageSelect,
	page,
}) => {
	const status = getPageStripStatus(page.status);
	const thumbnailUrl = page.thumbUrl ?? page.imageUrl;

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
				{PAGE_STATUS_SYMBOL[status]}
			</span>

			{!isCurrent && (
				<span aria-hidden="true" className="tx-page-thumb">
					{thumbnailUrl && (
						<img
							alt=""
							className="tx-page-thumb-image"
							loading="lazy"
							src={thumbnailUrl}
						/>
					)}
				</span>
			)}
		</Button>
	);
};

export { PageButton };
