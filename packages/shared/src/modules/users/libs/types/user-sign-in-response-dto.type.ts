import { type UserGetAllItemResponseDto } from "./user-get-all-item-response-dto.type.js";

type UserSignInResponseDto = {
	token: string;
	user: UserGetAllItemResponseDto;
};

export { type UserSignInResponseDto };
