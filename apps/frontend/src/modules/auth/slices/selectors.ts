import { type RootState } from "~/libs/types/types.js";

const selectUser = (state: RootState) => state.auth.user;

const selectIsAuthenticated = (state: RootState): boolean =>
	Boolean(state.auth.user);

export { /** @public */ selectIsAuthenticated, selectUser };
