import { Navigate, Outlet } from "react-router-dom";

import { LoaderOverlay } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useAppSelector } from "~/libs/hooks/hooks.js";
import {
	selectIsAuthenticated,
	selectIsInitialized,
} from "~/modules/auth/auth.js";

const ProtectedRoute: React.FC = () => {
	const isInitialized = useAppSelector(selectIsInitialized);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	if (!isInitialized) {
		return <LoaderOverlay />;
	}

	if (!isAuthenticated) {
		return <Navigate replace to={AppRoute.SIGN_IN} />;
	}

	return <Outlet />;
};

export { ProtectedRoute };
