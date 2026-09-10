import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentStatus } from "../enums/document-status.enum.js";

type DocumentGetAllItemResponseDto = {
	budgetUsd: string;
	createdAt: string;
	cursorPageNo: number;
	id: number;
	ownerId: number;
	pageCount: number;
	spentUsd: string;
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

export { type DocumentGetAllItemResponseDto };
