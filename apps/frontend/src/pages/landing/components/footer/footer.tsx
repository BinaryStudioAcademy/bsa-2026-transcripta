import { Logo } from "~/libs/components/components.js";

import "./footer.css";

const Footer: React.FC = () => {
	return (
		<footer className="footer">
			<span className="footer__brand">
				<Logo size="small" />
			</span>

			<span className="footer__copyright tnum">© 2026 Transcripta · BSA</span>
		</footer>
	);
};

export { Footer };
