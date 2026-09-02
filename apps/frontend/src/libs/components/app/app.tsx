import { AUTH_ROUTES } from "~/libs/components/app/libs/constants/auth-routes.constant.js";
import {
	Header,
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
import { selectIsInitialized } from "~/modules/auth/auth.js";
import { restoreSession } from "~/modules/auth/slices/actions.js";

const App: React.FC = () => {
	const { pathname } = useLocation();
	const dispatch = useAppDispatch();
	const isInitialized = useAppSelector(selectIsInitialized);
	const isAuthPage = AUTH_ROUTES.has(pathname as ValueOf<typeof AppRoute>);

	useEffect(() => {
		void dispatch(restoreSession());
	}, [dispatch]);

	if (!isInitialized) {
		return <LoaderOverlay />;
	}

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
