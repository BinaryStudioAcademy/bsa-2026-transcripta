import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";

import styles from "./styles.module.css";

const NotFound: React.FC = () => {
	return (
		<main className={styles["container"]}>
			<p className={styles["code"]}>404</p>
			<h1 className={styles["title"]}>This page does not exist</h1>
			<p className={styles["description"]}>
				The link may be broken, or the page may have been moved or deleted.
			</p>
			<div className={styles["link"]}>
				<Link to={AppRoute.ROOT}>Back to your documents</Link>
			</div>
		</main>
	);
};

export { NotFound };
