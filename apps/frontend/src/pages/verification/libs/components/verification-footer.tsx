import { Button, Loader } from "~/libs/components/components.js";
import { LoaderSize } from "~/libs/enums/loader-size.enum.js";

import {
	MIN_NUMBER_OF_PAGES,
	PAGE_STRIP_LEGEND,
} from "../constants/verification.constants.js";
import { type DocumentGetPagesItemResponseDto } from "../types/types.js";
import { PageButton } from "./components.js";

type VerificationFooterProperties = {
	currentPageNo: number;
	cursorPageNo: null | number;
	isLoading: boolean;
	onNext: () => void;
	onPageSelect: (pageNo: number) => void;
	onPrevious: () => void;
	pageCount?: number;
	pages: (DocumentGetPagesItemResponseDto | undefined)[];
};

const VerificationFooter: React.FC<VerificationFooterProperties> = ({
	currentPageNo,
	cursorPageNo,
	isLoading,
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
					const isCursor = page.pageNo === cursorPageNo;

					return (
						<PageButton
							isCurrent={isCurrent}
							isCursor={isCursor}
							key={page.id}
							onPageSelect={onPageSelect}
							page={page}
						/>
					);
				})}

				{isLoading && <Loader label="Loading pages" size={LoaderSize.SMALL} />}

				<Button
					aria-label="Next"
					className="tx-page"
					isDisabled={pageCount === undefined || currentPageNo >= pageCount}
					label="►"
					onClick={onNext}
					type="button"
				/>
			</div>

			<span className="tx-pstrip-legend">
				{PAGE_STRIP_LEGEND.map(({ label, symbol }) => (
					<span className="tx-pstrip-legend-item" key={label}>
						{symbol} {label}
					</span>
				))}
			</span>
		</footer>
	);
};

export { VerificationFooter };
