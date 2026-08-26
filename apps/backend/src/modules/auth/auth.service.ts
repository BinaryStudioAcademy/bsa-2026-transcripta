import { type TokenServiceInterface } from "~/libs/modules/token/token.js";
import {
	type UserSignUpRequestDto,
	type UserSignUpResponseDto,
} from "~/modules/users/libs/types/types.js";
import { type UserService } from "~/modules/users/user.service.js";

class AuthService {
	private token: TokenServiceInterface;
	private userService: UserService;

	public constructor(userService: UserService, token: TokenServiceInterface) {
		this.userService = userService;
		this.token = token;
	}

	public signUp(
		userRequestDto: UserSignUpRequestDto,
	): Promise<UserSignUpResponseDto> {
		return this.userService.create(userRequestDto);
	}
}

export { AuthService };
