import { Header, RouterOutlet } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useLocation } from "~/libs/hooks/hooks.js";

const App: React.FC = () => {
	const { pathname } = useLocation();
	const isRoot = pathname === AppRoute.ROOT;

	return (
		<>
			<div>
				{isRoot && <Header />}
				<main>
					<RouterOutlet />
				</main>
			</div>
		</>
	);
};

export { App };
