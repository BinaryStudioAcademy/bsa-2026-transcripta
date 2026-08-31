import { type ValueOf } from "src/libs/types/types.js";

import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentCreateResponseDto = {
	expiresAt: string;
	id: number;
	status: ValueOf<typeof DocumentStatus>;
	uploadUrl: string;
};

export { type DocumentCreateResponseDto };
