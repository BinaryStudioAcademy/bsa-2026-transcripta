import { RouterOutlet, Sidebar } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useLocation } from "~/libs/hooks/hooks.js";

const App: React.FC = () => {
	const { pathname } = useLocation();

	const isAuthPage =
		pathname === AppRoute.SIGN_IN || pathname === AppRoute.SIGN_UP;

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
