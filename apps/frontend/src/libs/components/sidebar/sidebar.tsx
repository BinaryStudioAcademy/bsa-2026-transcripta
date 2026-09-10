import { Link, LogoIcon } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";
import { actions as authActions, selectUser } from "~/modules/auth/auth.js";

import { NAV_ITEMS } from "./libs/constants/constants.js";

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
	`sidebar__link${isActive ? " sidebar__link--active" : ""}`;

const Sidebar: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const user = useAppSelector(selectUser);

	const handleSignOut = useCallback((): void => {
		// eslint-disable-next-line sonarjs/void-use -- navigate() can return a promise here; no-floating-promises requires marking it void
		void navigate(AppRoute.SIGN_IN, {
			flushSync: true,
			replace: true,
		});

		dispatch(authActions.logout());
		void storage.drop(StorageKey.TOKEN);
	}, [dispatch, navigate]);

	return (
		<aside className="sidebar">
			<Link className="sidebar__brand" to={AppRoute.ROOT}>
				<LogoIcon size="medium" />
				<span className="sidebar__brand-wordmark">Transcripta</span>
			</Link>

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
