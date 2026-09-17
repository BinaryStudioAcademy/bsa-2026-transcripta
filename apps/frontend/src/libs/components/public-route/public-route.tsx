import { Navigate, Outlet } from "react-router-dom";

import { AppRoute } from "~/libs/enums/enums.js";
import { useAppSelector } from "~/libs/hooks/hooks.js";
import { selectIsAuthenticated } from "~/modules/auth/auth.js";

const PublicRoute: React.FC = () => {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	if (isAuthenticated) {
		return <Navigate replace to={AppRoute.ROOT} />;
	}

	return <Outlet />;
};

export { PublicRoute };
