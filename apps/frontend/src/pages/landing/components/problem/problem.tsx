import "./problem.css";

const Problem: React.FC = () => {
	return (
		<section className="problem" id="problem">
			<div className="problem__container">
				<h2 className="problem__title">
					There are millions of pages of handwritten archives that nobody has
					digitised, because:
				</h2>

				<div className="problem__cards">
					<div className="problem__card">
						<h3 className="problem__card-title">Typing by hand</h3>

						<p className="problem__card-description">
							<span className="tnum">3-5</span> minutes per page.{" "}
							<span className="tnum">500</span> pages = a week of work.
						</p>
					</div>

					<div className="problem__card">
						<h3 className="problem__card-title">Ordinary OCR</h3>

						<p className="problem__card-description">
							Cannot read handwriting at all.
						</p>
					</div>

					<div className="problem__card">
						<h3 className="problem__card-title">Specialised HTR</h3>

						<p className="problem__card-description">
							You must label dozens of hours of material first, to train the
							model.
						</p>
					</div>
				</div>

				<p className="problem__conclusion">
					Transcripta offers a third way: <strong>zero preparation</strong>, and
					accuracy that grows while you work.
				</p>
			</div>
		</section>
	);
};

export { Problem };
