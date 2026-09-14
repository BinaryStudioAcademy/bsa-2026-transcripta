import { Link, LogoIcon } from "~/libs/components/components.js";
import { UPLOAD_WARNING_MESSAGE } from "~/libs/constants/constants.js";
import { AppRoute } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useLocation,
	useNavigate,
	useState,
} from "~/libs/hooks/hooks.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";
import { actions as authActions, selectUser } from "~/modules/auth/auth.js";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	LogOutIcon,
} from "./libs/components/icons.js";
import { NAV_ITEMS } from "./libs/constants/constants.js";

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
	`sidebar__link${isActive ? " sidebar__link--active" : ""}`;

const Sidebar: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const user = useAppSelector(selectUser);
	const { pathname } = useLocation();

	const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	useEffect(() => {
		const loadCollapsedState = async (): Promise<void> => {
			const storedCollapsedState = await storage.get(
				StorageKey.SIDEBAR_COLLAPSED,
			);

			if (storedCollapsedState !== null) {
				setIsCollapsed(storedCollapsedState === "true");
			}

			setIsLoaded(true);
		};

		void loadCollapsedState();
	}, []);

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		void storage.set(
			StorageKey.SIDEBAR_COLLAPSED,
			isCollapsed ? "true" : "false",
		);
	}, [isCollapsed, isLoaded]);

	const handleToggleCollapsed = useCallback((): void => {
		setIsCollapsed((previousState) => !previousState);
	}, []);

	const handleSignOut = useCallback(
		(event: React.MouseEvent): void => {
			if (pathname === AppRoute.DOCUMENTS_NEW) {
				const confirmLeave = globalThis.confirm(UPLOAD_WARNING_MESSAGE);

				if (!confirmLeave) {
					event.preventDefault();
					event.nativeEvent.stopImmediatePropagation();
					return;
				}
			}

			// eslint-disable-next-line sonarjs/void-use -- navigate() can return a promise here; no-floating-promises requires marking it void
			void navigate(AppRoute.SIGN_IN, {
				flushSync: true,
				replace: true,
			});

			dispatch(authActions.logout());
			void storage.drop(StorageKey.TOKEN);
		},
		[dispatch, navigate, pathname],
	);

	const sidebarClassName = `sidebar${isCollapsed ? " sidebar--collapsed" : ""}`;

	return (
		<aside className={sidebarClassName}>
			<Link
				className="sidebar__brand"
				title={isCollapsed ? "Transcripta" : undefined}
				to={AppRoute.ROOT}
			>
				<LogoIcon size="medium" />
				<span className="sidebar__brand-wordmark">Transcripta</span>
			</Link>

			<nav className="sidebar__nav">
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;

					return (
						<Link
							className={getLinkClassName}
							key={item.route}
							title={item.label}
							to={item.route}
						>
							<Icon />
							<span className="sidebar__nav-label">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<button
				aria-expanded={!isCollapsed}
				aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				className="sidebar__collapse"
				onClick={handleToggleCollapsed}
				type="button"
			>
				{isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
			</button>

			<div className="sidebar__spacer" />

			<div className="sidebar__user">
				<span className="sidebar__user-email">{user?.email}</span>
				<button
					aria-label="Sign out"
					className="sidebar__sign-out"
					onClick={handleSignOut}
					title="Sign out"
					type="button"
				>
					{isCollapsed ? <LogOutIcon /> : "Sign out"}
				</button>
			</div>
		</aside>
	);
};

export { Sidebar };
