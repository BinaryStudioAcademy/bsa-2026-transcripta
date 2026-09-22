import styles from "./styles.module.css";

type Properties = {
	action?: React.ReactNode;
	children: React.ReactNode;
	count?: React.ReactNode;
	isMuted?: boolean;
	title: string;
};

const DocumentSection: React.FC<Properties> = ({
	action,
	children,
	count,
	isMuted = false,
	title,
}: Properties) => (
	<section
		className={[styles["section"], isMuted && styles["section--muted"]]
			.filter(Boolean)
			.join(" ")}
	>
		<div className={styles["header"]}>
			<h2
				className={[styles["title"], isMuted && styles["title--muted"]]
					.filter(Boolean)
					.join(" ")}
			>
				{title}
			</h2>
			{count && (
				<span className={["tx-num", styles["count"]].join(" ")}>{count}</span>
			)}
			{action}
		</div>
		{children}
	</section>
);

export { DocumentSection };
