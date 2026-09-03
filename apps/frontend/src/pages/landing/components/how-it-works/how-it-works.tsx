import "./how-it-works.css";

const HowItWorks: React.FC = () => {
	return (
		<section className="how-it-works" id="how-it-works">
			<div className="how-it-works__container">
				<h2 className="how-it-works__title">How it works</h2>

				<ul className="how-it-works__steps">
					<li className="how-it-works__step">
						<span className="how-it-works__step-number tnum">01</span>

						<span className="how-it-works__step-text">
							Upload a PDF of a <span className="tnum">300</span>
							-page parish register
						</span>
					</li>

					<li className="how-it-works__step">
						<span className="how-it-works__step-number tnum">02</span>

						<span className="how-it-works__step-text">
							Pick the preset "19th-century parish register" — or create your
							own
						</span>
					</li>

					<li className="how-it-works__step">
						<span className="how-it-works__step-number tnum">03</span>

						<span className="how-it-works__step-text">
							A minute later, see the first transcribed pages
						</span>
					</li>

					<li className="how-it-works__step">
						<span className="how-it-works__step-number tnum">04</span>

						<span className="how-it-works__step-text how-it-works__step-text--controls">
							Go through the pages: <kbd className="tx-kbd">Enter</kbd> —
							correct, or edit the text and <kbd className="tx-kbd">Enter</kbd>
						</span>
					</li>

					<li className="how-it-works__step">
						<span className="how-it-works__step-number how-it-works__step-number--highlight tnum">
							05
						</span>

						<span className="how-it-works__step-content">
							<span className="how-it-works__step-highlight">
								Notice that from page <span className="tnum">50</span> onwards
								corrections are far rarer
							</span>

							<span className="how-it-works__step-note">
								Step 5 is exactly what the project exists for.
							</span>
						</span>
					</li>

					<li className="how-it-works__step">
						<span className="how-it-works__step-number tnum">06</span>

						<span className="how-it-works__step-text">
							Export the result to CSV
						</span>
					</li>
				</ul>

				<div className="how-it-works__summary">
					<span className="how-it-works__summary-item">
						<span className="how-it-works__summary-value how-it-works__summary-value--highlight tnum">
							~50 minutes
						</span>{" "}
						of human time
					</span>

					<span className="how-it-works__summary-vs">vs</span>

					<span className="how-it-works__summary-item how-it-works__summary-item--secondary">
						<span className="how-it-works__summary-value tnum">20 hours</span>{" "}
						typing by hand
					</span>
				</div>
			</div>
		</section>
	);
};

export { HowItWorks };
