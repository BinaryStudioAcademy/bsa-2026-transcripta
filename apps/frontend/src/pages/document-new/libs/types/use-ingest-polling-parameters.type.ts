import { type NavigateFunction } from "react-router-dom";

import { useAppDispatch } from "~/libs/hooks/hooks.js";
import { DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";

type UseIngestPollingParameters = {
	dispatch: ReturnType<typeof useAppDispatch>;
	ingestingDocumentId: null | number;
	navigate: NavigateFunction;
	resumedDocument: DocumentGetByIdResponseDto | null;
	setIngestingDocumentId: React.Dispatch<React.SetStateAction<null | number>>;
	setRejection: React.Dispatch<React.SetStateAction<null | string>>;
};

export { type UseIngestPollingParameters };
