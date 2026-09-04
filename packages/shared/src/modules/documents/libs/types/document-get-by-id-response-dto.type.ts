import { type ValueOf } from "../../../../libs/types/value-of.type.js";
import { DocumentStatus } from "../enums/document-status.enum.js";
import { type DocumentGetByIdBudgetResponseDto } from "./document-get-by-id-budget-response-dto.type.js";
import { type DocumentGetByIdGroundTruthResponseDto } from "./document-get-by-id-ground-truth-response-dto.type.js";
import { type DocumentGetByIdPresetResponseDto } from "./document-get-by-id-preset-response-dto.type.js";
import { type DocumentGetByIdProgressResponseDto } from "./document-get-by-id-progress-response-dto.type.js";

type DocumentGetByIdResponseDto = {
	budget: DocumentGetByIdBudgetResponseDto;
	cursorPageNo: number;
	groundTruth: DocumentGetByIdGroundTruthResponseDto | null;
	id: number;
	pageCount: number;
	preset: DocumentGetByIdPresetResponseDto;
	progress: DocumentGetByIdProgressResponseDto;
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

export { type DocumentGetByIdResponseDto };
