import { Button } from "~/libs/components/components.js";
import { MIN_NUMBER_OF_PAGES } from "~/libs/constants/verification.constants.js";

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
				<Button
					aria-label="Previous"
					className="tx-page"
					isDisabled={currentPageNo <= MIN_NUMBER_OF_PAGES}
					label="◄"
					onClick={onPrevious}
					type="button"
				/>

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

				<Button
					aria-label="Next"
					className="tx-page"
					isDisabled={pageCount === undefined || currentPageNo >= pageCount}
					label="►"
					onClick={onNext}
					type="button"
				/>
			</div>

			<span className="tx-pstrip-legend">▓ ready ░ running · queued</span>
		</footer>
	);
};

export { VerificationFooter };
