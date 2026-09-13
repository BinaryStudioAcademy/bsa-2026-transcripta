import { MIN_NUMBER_OF_PAGES } from "~/libs/constants/varification.constants.js";

import { type DocumentGetPagesItemResponseDto } from "../types/types.js";
import { PageButton } from "./components.js";

type VerificationFooterProperties = {
	currentPageNo: number;
	onNext: () => void;
	onPageSelect: (pageNo: number) => void;
	onPrevious: () => void;
	pageCount?: number;
	pages: (DocumentGetPagesItemResponseDto | undefined)[];
};

const VerificationFooter: React.FC<VerificationFooterProperties> = ({
	currentPageNo,
	onNext,
	onPageSelect,
	onPrevious,
	pageCount,
	pages,
}) => {
	return (
		<footer className="verification-footer">
			<div className="tx-pstrip">
				<button
					aria-label="Previous"
					className="tx-page"
					disabled={currentPageNo <= MIN_NUMBER_OF_PAGES}
					onClick={onPrevious}
					type="button"
				>
					◄
				</button>

				{pages.map((page) => {
					if (!page) {
						return null;
					}

					const isCurrent = page.pageNo === currentPageNo;

					return (
						<PageButton
							isCurrent={isCurrent}
							key={page.id}
							onPageSelect={onPageSelect}
							page={page}
						/>
					);
				})}

				<button
					aria-label="Next"
					className="tx-page"
					disabled={pageCount === undefined || currentPageNo >= pageCount}
					onClick={onNext}
					type="button"
				>
					►
				</button>
			</div>

			<span className="tx-pstrip-legend">▓ ready ░ running · queued</span>
		</footer>
	);
};

export { VerificationFooter };
