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
		storage.drop(StorageKey.TOKEN).catch(() => {});
		const result = navigate(AppRoute.SIGN_IN);
		if (result) {
			result.catch(() => {});
		}
	}, [dispatch, navigate]);

	return (
		<aside className="sidebar">
			<div className="sidebar__brand">
				<span className="sidebar__brand-tile">T</span>
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
