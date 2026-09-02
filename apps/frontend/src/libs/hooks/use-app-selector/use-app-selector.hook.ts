import { useSelector } from "react-redux";

import { type RootState } from "~/libs/types/types.js";

const useAppSelector = useSelector.withTypes<RootState>();

export { /** @public */ useAppSelector };
