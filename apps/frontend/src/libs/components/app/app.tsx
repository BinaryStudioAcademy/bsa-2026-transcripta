import {
	Header,
	LoaderOverlay,
	RouterOutlet,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import { useAppSelector, useLocation } from "~/libs/hooks/hooks.js";

const App: React.FC = () => {
	const { pathname } = useLocation();
	const { dataStatus } = useAppSelector(({ users }) => ({
		dataStatus: users.dataStatus,
		users: users.users,
	}));

	const isRoot = pathname === AppRoute.ROOT;
	const isLoading = isRoot && dataStatus === DataStatus.PENDING;

	return (
		<>
			<div>
				<Header />
				<main>
					<RouterOutlet />
				</main>
			</div>
			{isLoading && <LoaderOverlay label="Loading users" />}
		</>
	);
};

export { App };
