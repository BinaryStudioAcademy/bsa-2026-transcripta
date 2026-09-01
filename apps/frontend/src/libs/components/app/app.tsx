import { AUTH_ROUTES } from "~/libs/components/app/libs/constants/auth-routes.constant.js";
import {
	LoaderOverlay,
	RouterOutlet,
	Sidebar,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import { useAppSelector, useLocation } from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";
import { Landing } from "~/pages/landing/landing.js";

const App: React.FC = () => {
	const { pathname } = useLocation();

	const user = useAppSelector((state) => state.auth.user);
	const authStatus = useAppSelector((state) => state.auth.dataStatus);
	const isAuthenticated = Boolean(user);

	const isAuthPage = AUTH_ROUTES.has(pathname as ValueOf<typeof AppRoute>);

	if (authStatus === DataStatus.PENDING) {
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
