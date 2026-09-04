import "./loop.css";

const Loop: React.FC = () => {
	return (
		<section className="loop" id="loop">
			<div className="loop__container">
				<div className="loop__content">
					<h2 className="loop__title">Accuracy grows while you work.</h2>

					<p className="loop__description">
						Every word you confirm joins the document’s lexicon and feeds back
						into the prompt.
					</p>

					<p className="loop__description loop__description--secondary">
						By page <span className="tnum">50</span> the model already knows
						this document contains the surname “Ivanenko”, the village “Dykanka”
						and the phrase “born and baptised”. So it stops inventing
						“Ivanchenko”.
					</p>
				</div>

				<div className="loop__lexicon">
					<div className="loop__lexicon-header">
						<span className="loop__lexicon-title">Lexicon</span>

						<span className="loop__lexicon-count tnum">14 confirmed words</span>
					</div>

					<ul className="loop__lexicon-list">
						<li className="loop__lexicon-item">
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 4 pages"
							>
								Dykanka
							</button>

							<span className="loop__lexicon-pages tnum">seen on 4 pages</span>
						</li>

						<li className="loop__lexicon-item">
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 4 pages"
							>
								Ivanenko
							</button>

							<span className="loop__lexicon-pages tnum">seen on 4 pages</span>
						</li>

						<li className="loop__lexicon-item">
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 3 pages"
							>
								born and baptised
							</button>

							<span className="loop__lexicon-pages tnum">seen on 3 pages</span>
						</li>

						<li className="loop__lexicon-item">
							<button
								className="tx-mark tx-tip"
								data-tip="from the lexicon, seen on 2 pages"
							>
								Orthodox
							</button>

							<span className="loop__lexicon-pages tnum">seen on 2 pages</span>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
};

export { Loop };
