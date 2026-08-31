import { AUTH_ROUTES } from "~/libs/components/app/libs/constants/auth-routes.constant.js";
import { Header, RouterOutlet, Sidebar } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useLocation } from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";

const App: React.FC = () => {
	const { pathname } = useLocation();

	const isAuthPage = AUTH_ROUTES.has(pathname as ValueOf<typeof AppRoute>);

	if (isAuthPage) {
		return <RouterOutlet />;
	}

	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">
				{pathname === AppRoute.ROOT && <Header />}
				<RouterOutlet />
			</main>
		</div>
	);
};

export { App };
