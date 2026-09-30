import { Link, ThemeToggle } from "~/libs/components/components.js";
import {
	MAX_PERCENTAGE,
	PERCENTAGE_MULTIPLIER,
} from "~/libs/constants/common.constants.js";
import { INITIAL_COUNT } from "~/libs/constants/constants.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { getIsMacOs } from "~/libs/helpers/helpers.js";
import { useOverflowTooltip } from "~/libs/hooks/hooks.js";

import { DEFAULT_BUDGET, ZERO_BUDGET } from "../constants/budget.constants.js";

type VerificationHeaderProperties = {
	budgetLimit?: string;
	budgetSpent?: string;
	documentTitle?: string;
	isBudgetStopped: boolean;
	pageCount?: number;
	pageNo?: number | undefined;
};

const VerificationHeader: React.FC<VerificationHeaderProperties> = ({
	budgetLimit = DEFAULT_BUDGET,
	budgetSpent = DEFAULT_BUDGET,
	documentTitle,
	isBudgetStopped,
	pageCount,
	pageNo,
}) => {
	const { checkTruncation, elementReference, isTruncated } =
		useOverflowTooltip(documentTitle);

	const budgetPercentage =
		budgetLimit === ZERO_BUDGET
			? Number(ZERO_BUDGET)
			: Math.min(
					(Number(budgetSpent) / Number(budgetLimit)) * PERCENTAGE_MULTIPLIER,
					MAX_PERCENTAGE,
				);

	const isMacOs = getIsMacOs();

	return (
		<header className="verification-header">
			<Link className="verification-header__back" to={AppRoute.DOCUMENTS}>
				← Documents
			</Link>

			{documentTitle && (
				<span
					className={[
						"verification-header__title-wrapper",
						isTruncated && "tx-tip",
					]
						.filter(Boolean)
						.join(" ")}
					data-tip={isTruncated ? documentTitle : undefined}
					onMouseEnter={checkTruncation}
				>
					<strong className="verification-header__title" ref={elementReference}>
						{documentTitle}
					</strong>
				</span>
			)}

			{pageNo !== undefined && pageCount !== undefined && (
				<span className="verification-header__page">
					{pageCount > INITIAL_COUNT
						? `page ${String(pageNo)} of ${String(pageCount)}`
						: `page ${String(pageNo)} (processing...)`}
				</span>
			)}

			<div className="verification-header__spacer" />

			<div className="verification-header__shortcuts">
				<span className="tx-kbdrow">
					<span>
						<kbd className="tx-kbd">Enter</kbd>Confirm
					</span>
					<span>
						<kbd className="tx-kbd">E</kbd>Correct
					</span>
					<span>
						<kbd className="tx-kbd">S</kbd>Skip
					</span>
					<span>
						<kbd className="tx-kbd">{isMacOs ? "⌘+Z" : "Ctrl+Z"}</kbd>
						Undo
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
				<span
					className={["tx-budget", isBudgetStopped && "tx-budget--warn"]
						.filter(Boolean)
						.join(" ")}
				>
					<span className="tx-budget-bar">
						<i
							className="tx-budget-bar__fill"
							style={{ width: `${String(budgetPercentage)}%` }}
						/>
					</span>
					${budgetSpent} / ${budgetLimit}
				</span>
			</div>

			<ThemeToggle />
		</header>
	);
};

export { VerificationHeader };
