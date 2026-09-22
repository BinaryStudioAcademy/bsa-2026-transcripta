import { sha256 } from "~/modules/context/libs/helpers/hash.helper.js";

import { CONTEXT_HASH_SEPARATOR } from "../constants/constants.js";

const hashContext = (blocks: string[], model: string): string => {
	return sha256([...blocks, model].join(CONTEXT_HASH_SEPARATOR));
};

export { hashContext };
