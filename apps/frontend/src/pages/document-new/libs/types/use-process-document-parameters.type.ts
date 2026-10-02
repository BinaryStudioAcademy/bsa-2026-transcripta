import { useAppDispatch } from "~/libs/hooks/hooks.js";

type UseProcessDocumentParameters = {
	createdDocumentIdReference: React.RefObject<null | number>;
	dispatch: ReturnType<typeof useAppDispatch>;
	isStartingProcessing: boolean;
	resumeDocumentId: number | undefined;
	setIngestingDocumentId: React.Dispatch<React.SetStateAction<null | number>>;
	setIsStartingProcessing: React.Dispatch<React.SetStateAction<boolean>>;
	setRejection: React.Dispatch<React.SetStateAction<null | string>>;
};

export { type UseProcessDocumentParameters };
