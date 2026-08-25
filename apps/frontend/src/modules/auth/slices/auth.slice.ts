import { createSlice, isAnyOf } from "@reduxjs/toolkit";

import { DataStatus } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

import { signIn, signUp } from "./actions.js";

type State = {
	dataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
	dataStatus: DataStatus.IDLE,
};

const { actions, name, reducer } = createSlice({
	extraReducers(builder) {
		builder.addMatcher(isAnyOf(signIn.pending, signUp.pending), (state) => {
			state.dataStatus = DataStatus.PENDING;
		});
		builder.addMatcher(isAnyOf(signIn.fulfilled, signUp.fulfilled), (state) => {
			state.dataStatus = DataStatus.FULFILLED;
		});
		builder.addMatcher(isAnyOf(signIn.rejected, signUp.rejected), (state) => {
			state.dataStatus = DataStatus.REJECTED;
		});
	},
	initialState,
	name: "auth",
	reducers: {},
});

export { actions, name, reducer };
