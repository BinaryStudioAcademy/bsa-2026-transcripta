import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentGetAllItemResponseDto = {
	createdAt: string;
	id: number;
	ownerId: number;
	pageCount: number;
	sourceKey: string;
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

export { type DocumentGetAllItemResponseDto };
