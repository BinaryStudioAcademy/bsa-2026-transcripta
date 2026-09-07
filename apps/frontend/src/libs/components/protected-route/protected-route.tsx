import { Navigate, Outlet } from "react-router-dom";

import { AppRoute } from "~/libs/enums/enums.js";
import { useAppSelector } from "~/libs/hooks/hooks.js";
import { selectIsAuthenticated } from "~/modules/auth/auth.js";

const ProtectedRoute: React.FC = () => {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	if (!isAuthenticated) {
		return <Navigate replace to={AppRoute.SIGN_IN} />;
	}

	return <Outlet />;
};

export { ProtectedRoute };
