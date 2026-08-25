import { Button, Input, Link } from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { useAppForm, useCallback } from "~/libs/hooks/hooks.js";
import {
	UserSignUpRequestDto,
	userSignUpValidationSchema,
} from "~/modules/users/users.js";

import { DEFAULT_SIGN_IN_PAYLOAD } from "./libs/constants.js";

// Replace sign up with sign in
type Properties = {
	onSubmit: (payload: UserSignUpRequestDto) => void;
};

const SignInForm: React.FC<Properties> = ({ onSubmit }: Properties) => {
	const { control, errors, handleSubmit } = useAppForm<UserSignUpRequestDto>({
		defaultValues: DEFAULT_SIGN_IN_PAYLOAD,
		validationSchema: userSignUpValidationSchema,
	});

	const handleFormSubmit = useCallback(
		(event_: React.BaseSyntheticEvent): void => {
			void handleSubmit(onSubmit)(event_);
		},
		[handleSubmit, onSubmit],
	);

	return (
		<div>
			<div>
				<span>
					<svg></svg>
				</span>
				<span>Transcripta</span>
			</div>
			<div>
				<h1>Sign In</h1>
				<form onSubmit={handleFormSubmit}>
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
					<Button label="Sign in" type="submit" />
				</form>
				<div>
					{"No account yet? "}
					<Link to={AppRoute.SIGN_UP}>Create one</Link>
				</div>
			</div>
		</div>
	);
};

export { SignInForm };
