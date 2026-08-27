import { NavLink, useNavigate } from "react-router-dom";

import { AppRoute } from "~/libs/enums/enums.js";
import { useAppDispatch, useCallback } from "~/libs/hooks/hooks.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";
import { actions as authActions } from "~/modules/auth/auth.js";

import { NAV_ITEMS, PLACEHOLDER_EMAIL } from "./libs/constants.js";

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
	`sidebar__link${isActive ? " sidebar__link--active" : ""}`;

const Sidebar: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleSignOut = useCallback((): void => {
		dispatch(authActions.logout());
		void storage.drop(StorageKey.TOKEN);
		void Promise.resolve(navigate(AppRoute.SIGN_IN));
	}, [dispatch, navigate]);

	return (
		<aside className="sidebar">
			<div className="sidebar__brand">
				<span className="sidebar__brand-tile">
					<svg
						height="18"
						viewBox="0 0 48 48"
						width="18"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z" fill="#FFFDF8" />
						<path d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z" fill="#FFFDF8" />
						<circle cx="33.5" cy="38.5" fill="#FFFDF8" r="3.4" />
					</svg>
				</span>
				<span className="sidebar__brand-wordmark">Transcripta</span>
			</div>

			<nav className="sidebar__nav">
				{NAV_ITEMS.map((item) => (
					<NavLink
						className={getLinkClassName}
						key={item.route}
						to={item.route}
					>
						{item.label}
					</NavLink>
				))}
			</nav>

			<div className="sidebar__spacer" />

			<div className="sidebar__user">
				<span className="sidebar__user-email">{PLACEHOLDER_EMAIL}</span>
				<button
					className="sidebar__sign-out"
					onClick={handleSignOut}
					type="button"
				>
					Sign out
				</button>
			</div>
		</aside>
	);
};

export { Sidebar };
