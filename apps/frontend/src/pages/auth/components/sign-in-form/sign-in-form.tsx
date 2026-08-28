import { Button, Input, Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";
import {
	UserSignInRequestDto,
	userSignInValidationSchema,
} from "~/modules/users/users.js";

import { DEFAULT_SIGN_IN_PAYLOAD } from "./libs/constants.js";
import styles from "./styles.module.css";

type Properties = {
	onSubmit: (payload: UserSignInRequestDto) => void;
};

const SignInForm: React.FC<Properties> = ({ onSubmit }: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UserSignInRequestDto>({
		defaultValues: DEFAULT_SIGN_IN_PAYLOAD,
		validationSchema: userSignInValidationSchema,
	});

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit(onSubmit)(event_);
		},
		[handleSubmit, onSubmit],
	);

	return (
		<div className={styles["sign-in__container"]}>
			<div className={styles["sign-in__logo-container"]}>
				<span className={styles["sign-in__logo-icon"]}>
					<svg data-dc-tpl="30" height="14" viewBox="0 0 48 48" width="14">
						<path
							d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z"
							data-dc-tpl="31"
							fill="var(--on-accent)"
						></path>
						<path
							d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z"
							data-dc-tpl="32"
							fill="var(--on-accent)"
						></path>
						<circle
							cx="33.5"
							cy="38.5"
							data-dc-tpl="33"
							fill="var(--on-accent)"
							r="3.4"
						></circle>
					</svg>
				</span>
				<span className={styles["sign-in__logo-text"]}>Transcripta</span>
			</div>
			<div className={styles["sign-in__form-container"]}>
				<h1 className={styles["sign-in__form-title"]}>Sign In</h1>
				<form className={styles["sign-in__form"]} onSubmit={handleFormSubmit}>
					<Input
						control={control}
						errors={errors}
						label="Email"
						name="email"
						type="email"
					/>
					<Input
						control={control}
						errors={errors}
						label="Password"
						name="password"
						type="password"
					/>
					<Button isFluid isPrimary label="Sign in" type="submit" />
				</form>
				<div className={styles["sign-in__form-footer"]}>
					{"No account yet? "}
					<span className={styles["sign-in__form-footer-link"]}>
						<Link to={AppRoute.SIGN_UP}>Create one</Link>
					</span>
				</div>
			</div>
		</div>
	);
};

export { SignInForm };
