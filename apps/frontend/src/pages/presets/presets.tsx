import { EMPTY_LENGTH } from "@transcripta/shared";

import {
	Button,
	Link,
	LoaderOverlay,
	ThemeToggle,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { actions as presetsActions } from "~/modules/presets/presets.js";

import styles from "./presets.module.css";

const Presets: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { dataStatus, presets } = useAppSelector(({ presets }) => ({
		dataStatus: presets.dataStatus,
		presets: presets.presets,
	}));

	const isLoading = dataStatus === DataStatus.PENDING;

	useEffect(() => {
		void dispatch(presetsActions.loadAll());
	}, [dispatch]);

	const handleNewPreset = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(AppRoute.PRESETS_NEW);
		})();
	}, [navigate]);

	const isEmpty = presets.length === EMPTY_LENGTH;

	return (
		<div className={styles["presets-page"]}>
			<header className={styles["presets-page__header"]}>
				<h1 className={styles["presets-page__title"]}>Presets</h1>

				<div className={styles["presets-page__actions"]}>
					<Button
						className={styles["presets-page__new-btn"]}
						isPrimary
						label="+ New preset"
						onClick={handleNewPreset}
					/>
					<ThemeToggle />
				</div>
			</header>

			{isLoading ? (
				<LoaderOverlay label="Loading presets" />
			) : (
				<main className={styles["presets-page__main"]}>
					{isEmpty && (
						<div className={styles["presets-page__empty"]}>
							<h2 className={styles["presets-page__empty-title"]}>
								No presets yet
							</h2>

							<p className={styles["presets-page__empty-description"]}>
								Create a preset to define how documents should be transcribed.
							</p>

							<Button
								isPrimary
								label="+ New preset"
								onClick={handleNewPreset}
							/>
						</div>
					)}

					{!isEmpty && (
						<div
							aria-label="Presets"
							className={["tx-table", styles["presets-page__table"]]
								.filter(Boolean)
								.join(" ")}
							role="table"
						>
							<div className="tx-table__row" role="row">
								<span className="tx-table__columnheader" role="columnheader">
									Name
								</span>

								<span className="tx-table__columnheader" role="columnheader">
									Description
								</span>

								<span className="tx-table__columnheader" role="columnheader" />
							</div>

							{presets.map((preset) => (
								<div className="tx-table__row" key={preset.id} role="row">
									<div className={styles["presets-page__row"]}>
										<span
											className={[
												"tx-table__cell",
												styles["presets-page__name-cell"],
											]
												.filter(Boolean)
												.join(" ")}
											role="cell"
										>
											<Link
												className={styles["presets-page__row-link"] ?? ""}
												to={`${AppRoute.PRESETS}/${String(preset.id)}`}
											>
												<span className={styles["presets-page__name-text"]}>
													{preset.name}
												</span>
											</Link>
										</span>

										<span
											className={[
												"tx-table__cell",
												styles["presets-page__description-cell"],
											]
												.filter(Boolean)
												.join(" ")}
											role="cell"
										>
											{preset.description || "No description"}
										</span>
									</div>

									<span className="tx-table__cell" role="cell">
										<Link
											className={styles["presets-page__edit-link"] ?? ""}
											to={`${AppRoute.PRESETS}/${String(preset.id)}`}
										>
											Edit
										</Link>
									</span>
								</div>
							))}
						</div>
					)}
				</main>
			)}
		</div>
	);
};

export { Presets };
