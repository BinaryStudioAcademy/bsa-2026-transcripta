import { createAsyncThunk } from "@reduxjs/toolkit";

import { serializeError } from "~/libs/helpers/helpers.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";
import { type AsyncThunkConfig } from "~/libs/types/types.js";
import {
	type UserGetAllItemResponseDto,
	type UserSignInRequestDto,
	type UserSignInResponseDto,
	type UserSignUpRequestDto,
	type UserSignUpResponseDto,
} from "~/modules/users/users.js";

import { name as sliceName } from "./auth.slice.js";

const signIn = createAsyncThunk<
	UserSignInResponseDto,
	UserSignInRequestDto,
	AsyncThunkConfig
>(
	`${sliceName}/sign-in`,
	async (loginPayload, { extra }) => {
		const { authApi } = extra;
		const response = await authApi.signIn(loginPayload);

		await storage.set(StorageKey.TOKEN, response.token);

		return response;
	},
	{ serializeError },
);

const signUp = createAsyncThunk<
	UserSignUpResponseDto,
	UserSignUpRequestDto,
	AsyncThunkConfig
>(
	`${sliceName}/sign-up`,
	async (registerPayload, { extra }) => {
		const { authApi } = extra;

		const response = await authApi.signUp(registerPayload);

		await storage.set(StorageKey.TOKEN, response.token);

		return response;
	},
	{ serializeError },
);

const restoreSession = createAsyncThunk<
	null | UserGetAllItemResponseDto,
	undefined,
	AsyncThunkConfig
>(
	`${sliceName}/restore-session`,
	async (_, { extra }) => {
		const { userApi } = extra;

		const token = await storage.get(StorageKey.TOKEN);

		if (!token) {
			return null;
		}

		return await userApi.getMe();
	},
	{ serializeError },
);

export { restoreSession, signIn, signUp };
