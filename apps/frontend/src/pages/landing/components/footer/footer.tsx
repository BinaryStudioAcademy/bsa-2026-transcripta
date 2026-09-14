import { LogoIcon } from "~/libs/components/components.js";

import "./footer.css";

const Footer: React.FC = () => {
	return (
		<footer className="footer">
			<span className="footer__brand">
				<LogoIcon size="small" variant="mark" />
				{/* <img alt="Transcripta" className="footer__logo" src={logoSmall} /> */}

				<span className="footer__brand-name">Transcripta</span>
			</span>

			<span className="footer__copyright tnum">© 2026 Transcripta · BSA</span>
		</footer>
	);
};

export { Footer };
