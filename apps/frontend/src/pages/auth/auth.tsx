import { AppRoute } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useCallback,
	useLocation,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { actions as authActions } from "~/modules/auth/auth.js";
import {
	UserSignInRequestDto,
	type UserSignUpRequestDto,
} from "~/modules/users/users.js";

import { SignInForm, SignUpForm } from "./components/components.js";

const Auth: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const handleSignInSubmit = useCallback(
		(payload: UserSignInRequestDto): void => {
			void dispatch(authActions.signIn(payload))
				.unwrap()
				.then(() => navigate(AppRoute.ROOT))
				.catch(() => {});
		},
		[dispatch, navigate],
	);

	const handleSignUpSubmit = useCallback(
		(payload: UserSignUpRequestDto): void => {
			void (async (): Promise<void> => {
				try {
					await dispatch(authActions.signUp(payload)).unwrap();
					await navigate(AppRoute.ROOT);
				} catch {
					// Toast for API errors is a separate ticket: [FE] Error handling #7
				}
			})();
		},
		[dispatch, navigate],
	);

	const getScreen = (screen: string): React.JSX.Element => {
		if (screen === AppRoute.SIGN_UP) {
			return <SignUpForm onSubmit={handleSignUpSubmit} />;
		}

		return <SignInForm onSubmit={handleSignInSubmit} />;
	};

	return getScreen(pathname);
};

export { Auth };
