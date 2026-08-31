import { Link, LogoIcon } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
} from "~/libs/hooks/hooks.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";
import { actions as authActions } from "~/modules/auth/auth.js";

import { NAV_ITEMS } from "./libs/constants/constants.js";

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
	`sidebar__link${isActive ? " sidebar__link--active" : ""}`;

const Sidebar: React.FC = () => {
	const dispatch = useAppDispatch();

	const user = useAppSelector((state) => state.auth.user);

	const handleSignOut = useCallback((): void => {
		dispatch(authActions.logout());
		void storage.drop(StorageKey.TOKEN);
	}, [dispatch]);

	return (
		<aside className="sidebar">
			<div className="sidebar__brand">
				<LogoIcon size="medium" />
				<span className="sidebar__brand-wordmark">Transcripta</span>
			</div>

			<nav className="sidebar__nav">
				{NAV_ITEMS.map((item) => (
					<Link className={getLinkClassName} key={item.route} to={item.route}>
						{item.label}
					</Link>
				))}
			</nav>

			<div className="sidebar__spacer" />

			<div className="sidebar__user">
				<span className="sidebar__user-email">{user?.email}</span>
				<Link
					className="sidebar__sign-out"
					onClick={handleSignOut}
					to={AppRoute.SIGN_IN}
				>
					Sign out
				</Link>
			</div>
		</aside>
	);
};

export { Sidebar };
