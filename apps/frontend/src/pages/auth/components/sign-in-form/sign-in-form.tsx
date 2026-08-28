import { Button, Input } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";
import {
	type UserSignInRequestDto,
	userSignInValidationSchema,
} from "~/modules/users/users.js";

import { AuthLayout } from "../auth-layout/auth-layout.js";
import authLayoutStyles from "../auth-layout/styles.module.css";
import { DEFAULT_SIGN_IN_PAYLOAD } from "./libs/constants.js";

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
		<AuthLayout
			footerText="No account yet?"
			linkRoute={AppRoute.SIGN_UP}
			linkText="Create one"
			title="Sign In"
		>
			<form
				className={authLayoutStyles["auth-card__form"]}
				onSubmit={handleFormSubmit}
			>
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
		</AuthLayout>
	);
};

export { SignInForm };
