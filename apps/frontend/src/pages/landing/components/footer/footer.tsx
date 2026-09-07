import logoSmall from "~/assets/img/logo-small.svg";

import "./footer.css";

const Footer: React.FC = () => {
	return (
		<footer className="footer">
			<span className="footer__brand">
				<img alt="Transcripta" className="footer__logo" src={logoSmall} />

				<span className="footer__brand-name">Transcripta</span>
			</span>

			<span className="footer__copyright tnum">© 2026 Transcripta · BSA</span>
		</footer>
	);
};

export { Footer };
