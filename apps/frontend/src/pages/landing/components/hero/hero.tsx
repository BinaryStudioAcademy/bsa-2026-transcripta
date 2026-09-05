import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";

import "./hero.css";

const Hero: React.FC = () => {
	return (
		<section className="hero">
			<div className="hero__content">
				<h1 className="hero__title">
					Millions of handwritten pages. Nobody types them up.
				</h1>

				<p className="hero__description">
					Transcripta reads scanned handwriting with zero preparation — and its
					accuracy grows while you work.
				</p>

				<div className="hero__actions">
					<Link
						className="tx-btn tx-btn--primary tx-btn--landing"
						to={AppRoute.SIGN_UP}
					>
						Start transcribing
					</Link>

					<a
						className="tx-btn tx-btn--ghost tx-btn--landing"
						href="#how-it-works"
					>
						See how it works
					</a>
				</div>
			</div>

			<div className="hero__preview">
				<div className="hero__preview-header">
					<span className="hero__document-title">Parish register, 1887</span>

					<span className="hero__page-info tnum">page 47 of 300</span>
				</div>

				<div className="hero__document">
					<div className="hero__scan">
						<svg
							fill="none"
							height="100%"
							opacity="0.85"
							preserveAspectRatio="xMidYMin slice"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="1.3"
							viewBox="0 0 150 190"
							width="100%"
						>
							<path d="M14 20 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 44 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 68 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 92 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 116 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 140 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
							<path d="M6 164 q5 -9 10 0 t10 0 t10 0 t10 0 t10 0 t10 0" />
						</svg>
					</div>

					<div className="hero__transcription">
						No. 15. Born on 11 January, Anna. Parents: peasant of{" "}
						<div>
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 4 pages"
							>
								Dykanka
							</button>
						</div>{" "}
						village, Petr{" "}
						<div>
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 4 pages"
							>
								Ivanenko
							</button>
						</div>{" "}
						and his lawful wife Maria, both Orthodox.
					</div>
				</div>

				<div className="hero__footer">
					<div>
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
						</span>
					</div>

					<div>
						<span className="hero__budget">
							<span className="tx-budget">
								<span className="tx-budget-bar">
									<i className="hero__budget-progress" />
								</span>
								$0.98 / $10.00
							</span>
						</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export { Hero };
