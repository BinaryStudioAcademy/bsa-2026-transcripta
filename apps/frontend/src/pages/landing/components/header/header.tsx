import headerLogo from "~/assets/img/logo.svg";
import { Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";

import "./header.css";

const Header: React.FC = () => {
	return (
		<header className="header">
			<Link className="header-brand" to={AppRoute.ROOT}>
				<img alt="Transcripta logo" className="header-logo" src={headerLogo} />
				<span className="header-title">Transcripta</span>
			</Link>

			<nav aria-label="Main navigation" className="header-nav">
				<ul className="header-nav__list">
					<li>
						<a className="header-link" href="#how-it-works">
							How it works
						</a>
					</li>

					<li>
						<a className="header-link" href="#document-types">
							Document types
						</a>
					</li>

					<li>
						<Link className="header-link__btn" to={AppRoute.SIGN_UP}>
							Sign up
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export { Header };
