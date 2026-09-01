import { Button, Input } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";
import {
	type UserSignUpRequestDto,
	userSignUpValidationSchema,
} from "~/modules/users/users.js";

import { AuthLayout } from "../auth-layout/auth-layout.js";
import authLayoutStyles from "../auth-layout/styles.module.css";
import { DEFAULT_SIGN_UP_PAYLOAD } from "./libs/constants.js";

type Properties = {
	onSubmit: (payload: UserSignUpRequestDto) => void;
};

const SignUpForm: React.FC<Properties> = ({ onSubmit }: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UserSignUpRequestDto>({
		defaultValues: DEFAULT_SIGN_UP_PAYLOAD,
		validationSchema: userSignUpValidationSchema,
	});

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit(onSubmit)(event_);
		},
		[handleSubmit, onSubmit],
	);

	return (
		<AuthLayout
			description="Turn scanned handwritten pages into verified text."
			footerText="Already have an account?"
			linkRoute={AppRoute.SIGN_IN}
			linkText="Sign in"
			title="Create your account"
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
					placeholder="you@archive.org"
					type="text"
				/>
				<Input
					control={control}
					errors={errors}
					helperText="At least 8 characters."
					label="Password"
					name="password"
					type="password"
				/>
				<Button isFluid isPrimary label="Create account" type="submit" />
			</form>
		</AuthLayout>
	);
};

export { SignUpForm };
