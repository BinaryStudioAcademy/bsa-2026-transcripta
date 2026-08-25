import { RouterOutlet, Sidebar } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useLocation } from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";

const AUTH_ROUTES = new Set<ValueOf<typeof AppRoute>>([
	AppRoute.SIGN_IN,
	AppRoute.SIGN_UP,
]);

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
				<RouterOutlet />
			</main>
		</div>
	);
};

export { App };
