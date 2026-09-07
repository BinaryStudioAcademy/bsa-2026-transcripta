import { type ValueOf } from "~/libs/types/types.js";

import { type StorageBucket } from "../enums/enums.js";

type DeleteByPrefixRequest = {
	bucket: ValueOf<typeof StorageBucket>;
	prefix: string;
};

export { type DeleteByPrefixRequest };
