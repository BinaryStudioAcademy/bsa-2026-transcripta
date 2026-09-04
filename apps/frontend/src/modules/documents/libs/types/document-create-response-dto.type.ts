import { type ValueOf } from "~/libs/types/types.js";

import { DocumentStatus } from "../enums/enums.js";

type DocumentCreateResponseDto = {
	expiresAt: string;
	id: number;
	status: ValueOf<typeof DocumentStatus>;
	uploadUrl: string;
};

export { type DocumentCreateResponseDto };
