import { type BaseEncryption } from "~/libs/modules/encryption/base-encryption.module.js";
import { HTTPCode, HTTPError } from "~/libs/modules/http/http.js";
import {
	type UserSignInRequestDto,
	type UserSignInResponseDto,
	type UserSignUpRequestDto,
	type UserSignUpResponseDto,
} from "~/modules/users/libs/types/types.js";
import { type UserService } from "~/modules/users/user.service.js";

class AuthService {
	private encryption: BaseEncryption;
	private userService: UserService;

	public constructor(userService: UserService, encryption: BaseEncryption) {
		this.userService = userService;
		this.encryption = encryption;
	}

	public async signIn(
		userRequestDto: UserSignInRequestDto,
	): Promise<UserSignInResponseDto> {
		const userEntity = await this.userService.findByEmail(userRequestDto.email);

		if (!userEntity) {
			throw new HTTPError({
				message: "Invalid email or password",
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
				message: "invalid email or password",
				status: HTTPCode.UNAUTHORIZED,
			});
		}

		// This can be modified once the #5 JWT token service task is done
		const token = "IMAGINARY_TOKEN";

		return {
			token,
			user: userEntity.toObject(),
		};
	}

	public signUp(
		userRequestDto: UserSignUpRequestDto,
	): Promise<UserSignUpResponseDto> {
		return this.userService.create(userRequestDto);
	}
}

export { AuthService };
