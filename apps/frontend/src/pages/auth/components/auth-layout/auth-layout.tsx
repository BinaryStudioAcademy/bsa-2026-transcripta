import React from "react";

import { Link, LogoIcon } from "~/libs/components/components.js";
import { type AppRoute } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

import styles from "./styles.module.css";

type Properties = {
	children: React.ReactNode;
	description?: string;
	footerText: string;
	linkRoute: ValueOf<typeof AppRoute>;
	linkText: string;
	title: string;
};

const AuthLayout: React.FC<Properties> = ({
	children,
	description,
	footerText,
	linkRoute,
	linkText,
	title,
}: Properties) => {
	return (
		<div className={styles["auth-page"]}>
			<svg
				className={styles["auth-page__watermark"]}
				height="520"
				viewBox="0 0 48 48"
				width="520"
			>
				<path
					d="M9 13 L39 9.5 L37.4 15.2 L10.6 17.4 Z"
					fill="var(--text)"
				></path>
				<path
					d="M20.8 14.6 L27.6 13.9 L25.2 41.5 L23.4 41.5 Z"
					fill="var(--text)"
				></path>
				<circle cx="30.5" cy="39.5" fill="var(--text)" r="2.2"></circle>
			</svg>
			<div className={styles["auth-page__container"]}>
				<div className={styles["auth-card"]}>
					<div className={styles["auth-card__logo-container"]}>
						<LogoIcon size="small" />
						<span className={styles["auth-card__logo-text"]}>Transcripta</span>
					</div>
					<div className={styles["auth-card__form-container"]}>
						<div className={styles["auth-card__header"]}>
							<h1 className={styles["auth-card__form-title"]}>{title}</h1>
							{description && (
								<p className={styles["auth-card__description"]}>
									{description}
								</p>
							)}
						</div>
						{children}
						<div className={styles["auth-card__form-footer"]}>
							{`${footerText} `}
							<span className={styles["auth-card__form-footer-link"]}>
								<Link to={linkRoute}>{linkText}</Link>
							</span>
						</div>
					</div>
				</div>
				<p className={styles["auth-page__footer-text"]}>
					Transcripta · BSA 2026
				</p>
			</div>
		</div>
	);
};

export { AuthLayout };
