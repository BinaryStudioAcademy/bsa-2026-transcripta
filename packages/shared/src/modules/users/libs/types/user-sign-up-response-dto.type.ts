import { UserGetAllItemResponseDto } from "./user-get-all-item-response-dto.type.js";

type UserSignUpResponseDto = {
	token: string;
	user: UserGetAllItemResponseDto;
};

export { type UserSignUpResponseDto };
