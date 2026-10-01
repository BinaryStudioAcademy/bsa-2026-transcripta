import { AppRoute } from "~/libs/enums/enums.js";
import { useEffect, useNavigate } from "~/libs/hooks/hooks.js";
import { type DocumentGetByIdResponseDto } from "~/modules/documents/documents.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

const useDraftRedirect = (
	document: DocumentGetByIdResponseDto | null,
	documentId: number,
): void => {
	const navigate = useNavigate();

	useEffect(() => {
		if (
			!document ||
			document.id !== documentId ||
			document.status !== DocumentStatus.DRAFT
		) {
			return;
		}

		const documentIdToResume = document.id;

		void (async (): Promise<void> => {
			await navigate(AppRoute.DOCUMENTS_NEW, {
				replace: true,
				state: { documentId: documentIdToResume },
			});
		})();
	}, [document, documentId, navigate]);
};

export { useDraftRedirect };
