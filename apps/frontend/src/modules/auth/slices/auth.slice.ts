import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";
import { UserGetAllItemResponseDto } from "~/modules/users/users.js";

import { signIn, signUp } from "./actions.js";

type State = {
	dataStatus: ValueOf<typeof DataStatus>;
	user: null | UserGetAllItemResponseDto;
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
	user: null,
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addMatcher(isAnyOf(signIn.pending, signUp.pending), (state) => {
			state.dataStatus = DataStatus.PENDING;
		});
		builder.addMatcher(
			isAnyOf(signIn.fulfilled, signUp.fulfilled),
			(state, action) => {
				state.dataStatus = DataStatus.FULFILLED;
				state.user = action.payload.user;
			},
		);
		builder.addMatcher(isAnyOf(signIn.rejected, signUp.rejected), (state) => {
			state.dataStatus = DataStatus.REJECTED;
			state.user = null;
		});
	},
	initialState,
	name: "auth",
	reducers: {},
});

export { actions, name, reducer };
