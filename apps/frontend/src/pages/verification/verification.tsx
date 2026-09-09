import { LoaderOverlay } from "~/libs/components/components.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useEffect,
	useParams,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";
import {
	actions as pageActions,
	selectCurrentPage,
	selectPagesDataStatus,
} from "~/modules/pages/pages.js";

const Verification: React.FC = () => {
	const dispatch = useAppDispatch();
	const { id } = useParams();

	const { document, documentDataStatus } = useAppSelector(({ documents }) => ({
		document: documents.document,
		documentDataStatus: documents.documentDataStatus,
	}));
	const currentPage = useAppSelector(selectCurrentPage);
	const pagesDataStatus = useAppSelector(selectPagesDataStatus);

	useEffect(() => {
		const documentId = Number(id);

		if (!Number.isFinite(documentId)) {
			return;
		}

		void dispatch(documentActions.loadById(documentId));
	}, [id, dispatch]);

	useEffect(() => {
		if (!document) {
			return;
		}

		void dispatch(
			pageActions.loadPages({
				documentId: document.id,
				query: {
					from: document.cursorPageNo,
					limit: 5,
				},
			}),
		);
	}, [document, dispatch]);

	const isLoading =
		documentDataStatus === DataStatus.PENDING ||
		pagesDataStatus === DataStatus.PENDING;

	if (isLoading) {
		return <LoaderOverlay label="Loading verification" />;
	}

	return (
		<section>
			<h1>Verification</h1>

			{currentPage && (
				<>
					<p>Page {currentPage.pageNo}</p>

					<p>Img {currentPage.imageUrl}</p>

					<p>{currentPage.transcription?.text}</p>
				</>
			)}
		</section>
	);
};

export { Verification };
