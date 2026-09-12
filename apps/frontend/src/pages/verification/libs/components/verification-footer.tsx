import { getPageStripStatus } from "../helpers/get-page-strip-status.helper.js";
import { type DocumentGetPagesItemResponseDto } from "../types/types.js";
import { PageButton } from "./components.js";

type VerificationFooterProperties = {
	currentPageNo: number;
	pages: (DocumentGetPagesItemResponseDto | undefined)[];
};

const VerificationFooter: React.FC<VerificationFooterProperties> = ({
	currentPageNo,
	pages,
}) => {
	return (
		<footer className="verification-footer">
			<div className="tx-pstrip">
				<button aria-label="Previous" className="tx-page" type="button">
					◄
				</button>

				{pages.map((page) => {
					const isCurrent = page?.pageNo === currentPageNo;

					return (
						<PageButton
							isCurrent={isCurrent}
							key={page?.id}
							page={page?.pageNo}
							status={getPageStripStatus(page?.status, isCurrent)}
						/>
					);
				})}

				<button aria-label="Next" className="tx-page" type="button">
					►
				</button>
			</div>

			<span className="tx-pstrip-legend">▓ ready ░ running · queued</span>
		</footer>
	);
};

export { VerificationFooter };
