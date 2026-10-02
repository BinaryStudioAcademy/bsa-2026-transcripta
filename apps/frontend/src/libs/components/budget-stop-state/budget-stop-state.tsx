import { Button } from "../components.js";
import styles from "./styles.module.css";

type BudgetStopStateProperties = {
	limitUsd: string;
	onRaiseLimit: () => void;
	spentUsd: string;
};

const BudgetStopState: React.FC<BudgetStopStateProperties> = ({
	limitUsd,
	onRaiseLimit,
	spentUsd,
}) => {
	return (
		<div className={styles["state"]}>
			<h3 className={styles["title"]}>
				Spent <span className={styles["amount"]}>${spentUsd}</span> of{" "}
				<span className={styles["amount"]}>${limitUsd}</span>
			</h3>

			<p className={styles["reason"]}>
				Recognition stopped at your spending limit.
			</p>

			<div className={styles["actions"]}>
				<Button isPrimary label="Raise the limit" onClick={onRaiseLimit} />
			</div>
		</div>
	);
};

export { BudgetStopState };
