import { type BaseEncryption } from "~/libs/modules/encryption/base-encryption.module.js";
import { HTTPCode, HTTPError } from "~/libs/modules/http/http.js";
import { type TokenServiceInterface } from "~/libs/modules/token/token.js";
import {
	type UserSignInRequestDto,
	type UserSignInResponseDto,
	type UserSignUpRequestDto,
	type UserSignUpResponseDto,
} from "~/modules/users/libs/types/types.js";
import { type UserService } from "~/modules/users/user.service.js";

import { AuthErrorMessage } from "./libs/enums/auth-error-message.enum.js";

class AuthService {
	private encryption: BaseEncryption;
	private token: TokenServiceInterface;
	private userService: UserService;

	public constructor(
		userService: UserService,
		encryption: BaseEncryption,
		token: TokenServiceInterface,
	) {
		this.userService = userService;
		this.encryption = encryption;
		this.token = token;
	}

	public async signIn(
		userRequestDto: UserSignInRequestDto,
	): Promise<UserSignInResponseDto> {
		const userEntity = await this.userService.findByEmail(userRequestDto.email);

		if (!userEntity) {
			throw new HTTPError({
				message: AuthErrorMessage.INVALID_CREDENTIALS,
				status: HTTPCode.UNAUTHORIZED,
			});
		}

		const { passwordHash, passwordSalt } = userEntity.getPasswordCredentials();

		const isValidPassword = await this.encryption.compare(
			userRequestDto.password,
			passwordHash,
			passwordSalt,
		);

		if (!isValidPassword) {
			throw new HTTPError({
				message: AuthErrorMessage.INVALID_CREDENTIALS,
				status: HTTPCode.UNAUTHORIZED,
			});
		}

		const user = userEntity.toObject();
		const token = await this.token.create({ userId: user.id });

		return {
			token,
			user,
		};
	}

	public signUp(
		userRequestDto: UserSignUpRequestDto,
	): Promise<UserSignUpResponseDto> {
		return this.userService.create(userRequestDto);
	}
}

export { AuthService };
