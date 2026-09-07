import "./document-types.css";

const DocumentTypes: React.FC = () => {
	return (
		<section className="document-types" id="document-types">
			<div className="document-types__container">
				<h2 className="document-types__title">Document types</h2>

				<p className="document-types__description">
					The system is not tied to a genre.
				</p>

				<ul className="document-types__cards">
					<li className="document-types__card">
						<h3 className="document-types__card-title">
							Parish registers, census revisions
						</h3>

						<p className="document-types__card-description">
							Parish surnames, village names, set formulas.
						</p>
					</li>

					<li className="document-types__card">
						<h3 className="document-types__card-title">
							Medical records, case histories
						</h3>

						<p className="document-types__card-description">
							Diagnoses, drug names, the doctor’s abbreviations.
						</p>
					</li>

					<li className="document-types__card">
						<h3 className="document-types__card-title">Diaries, letters</h3>

						<p className="document-types__card-description">
							Names of relatives, places, forms of address.
						</p>
					</li>

					<li className="document-types__card">
						<h3 className="document-types__card-title">Ledgers, contracts</h3>

						<p className="document-types__card-description">
							Company names, legal formulas, units of measurement.
						</p>
					</li>

					<li className="document-types__card">
						<h3 className="document-types__card-title">
							Lab journals, lecture notes
						</h3>

						<p className="document-types__card-description">
							Terms, formulas, the author’s abbreviations.
						</p>
					</li>

					<li className="document-types__card">
						<h3 className="document-types__card-title">
							School registers, meeting minutes
						</h3>

						<p className="document-types__card-description">
							Surnames, job titles, department names.
						</p>
					</li>
				</ul>
			</div>
		</section>
	);
};

export { DocumentTypes };
