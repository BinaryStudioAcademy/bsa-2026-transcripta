import { AUTH_ROUTES } from "~/libs/components/app/libs/constants/auth-routes.constant.js";
import {
	LoaderOverlay,
	RouterOutlet,
	Sidebar,
} from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useEffect,
	useLocation,
} from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";
import {
	actions as authActions,
	selectIsAuthenticated,
	selectIsInitialized,
} from "~/modules/auth/auth.js";
import { Landing } from "~/pages/landing/landing.js";

const App: React.FC = () => {
	const { pathname } = useLocation();
	const dispatch = useAppDispatch();
	const isInitialized = useAppSelector(selectIsInitialized);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isAuthPage = AUTH_ROUTES.has(pathname as ValueOf<typeof AppRoute>);

	useEffect(() => {
		void dispatch(authActions.restoreSession());
	}, [dispatch]);

	if (!isInitialized) {
		return <LoaderOverlay />;
	}

	if (isAuthPage) {
		return <RouterOutlet />;
	}

	if (!isAuthenticated) {
		return <Landing />;
	}

	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">
				<RouterOutlet />
			</main>
		</div>
	);
};

export { App };
