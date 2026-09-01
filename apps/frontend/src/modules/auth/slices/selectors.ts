import { type store } from "~/libs/modules/store/store.js";

type RootState = ReturnType<typeof store.instance.getState>;

const selectUser = (state: RootState) => state.auth.user;

const selectIsAuthenticated = (state: RootState): boolean =>
	Boolean(state.auth.user);

export { /** @public */ selectIsAuthenticated, selectUser };
