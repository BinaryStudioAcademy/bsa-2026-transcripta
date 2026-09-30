import { INITIAL_COUNT } from "~/libs/constants/constants.js";

import { DocumentExportStatus, ExportStatusLabel } from "../enums/enums.js";
import { type DocumentExportItemResponseDto } from "../types/types.js";
import { formatExportDate } from "./format-export-date.helper.js";
import { formatFileSize } from "./format-file-size.helper.js";

type ExportMetaSource = Pick<
	DocumentExportItemResponseDto,
	"createdAt" | "sizeBytes" | "status"
>;

const getExportMeta = ({
	createdAt,
	sizeBytes,
	status,
}: ExportMetaSource): string => {
	if (status === DocumentExportStatus.FAILED) {
		return ExportStatusLabel.FAILED;
	}

	if (status === DocumentExportStatus.QUEUED) {
		return ExportStatusLabel.PREPARING;
	}

	return `${formatFileSize(sizeBytes ?? INITIAL_COUNT)} · ${formatExportDate(createdAt)}`;
};

export { getExportMeta };
