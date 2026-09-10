import { Link, ThemeToggle } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";

type VerificationHeaderProperties = {
	budgetLimit?: string | undefined;
	budgetSpent?: string | undefined;
	documentTitle?: string | undefined;
	pageCount?: number | undefined;
	pageNo?: number | undefined;
};

const VerificationHeader: React.FC<VerificationHeaderProperties> = ({
	budgetLimit = 0,
	budgetSpent = 0,
	documentTitle,
	pageCount,
	pageNo,
}) => {
	const budgetPercentage = Math.min(
		(Number(budgetSpent) / Number(budgetLimit)) * 100,
		100,
	);

	return (
		<header className="verification-header">
			<Link className="verification-header__back" to={AppRoute.DOCUMENTS}>
				← Documents
			</Link>

			{documentTitle && (
				<strong className="verification-header__title">{documentTitle}</strong>
			)}

			{pageNo !== undefined && pageCount !== undefined && (
				<span className="verification-header__page">
					page {pageNo} of {pageCount}
				</span>
			)}

			<div className="verification-header__spacer" />

			<div className="verification-header__shortcuts">
				<span className="tx-kbdrow">
					<span>
						<kbd className="tx-kbd">Enter</kbd>Correct
					</span>
					<span>
						<kbd className="tx-kbd">E</kbd>Edit
					</span>
					<span>
						<kbd className="tx-kbd">S</kbd>Skip
					</span>
					<span>
						<kbd className="tx-kbd">?</kbd>Shortcuts
					</span>
				</span>
			</div>

			<div className="verification-header__queue">
				<span className="tx-chip">
					<span className="verification-header__queue-count">3</span>
					unsaved actions
				</span>
			</div>

			<div className="verification-header__budget">
				<span className="tx-budget">
					<span className="tx-budget-bar">
						<i style={{ width: `${budgetPercentage}%` }} />
					</span>
					${budgetSpent} / ${budgetLimit}
				</span>
			</div>

			<ThemeToggle />
		</header>
	);
};

export { VerificationHeader };
