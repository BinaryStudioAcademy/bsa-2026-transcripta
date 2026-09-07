import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";

import "./cta.css";

const CTA: React.FC = () => {
	return (
		<section className="cta">
			<h2 className="cta__title">Your archive is waiting.</h2>

			<p className="cta__description">
				Set a budget, upload a PDF, and start confirming pages.
			</p>

			<Link
				className="tx-btn tx-btn--primary tx-btn--landing"
				to={AppRoute.SIGN_UP}
			>
				Start transcribing
			</Link>
		</section>
	);
};

export { CTA };
