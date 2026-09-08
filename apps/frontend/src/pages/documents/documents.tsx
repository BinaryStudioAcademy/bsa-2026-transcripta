import { DocumentStatus } from "@transcripta/shared";

import {
	Button,
	LoaderOverlay,
	StatusChip,
} from "~/libs/components/components.js";
import { AppRoute, DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useCallback,
	useEffect,
	useNavigate,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

import { EMPTY_LENGTH } from "./libs/constants/empty-length.constant.js";

const Documents: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { dataStatus, documents } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		documents: documents.documents,
	}));

	useEffect(() => {
		void dispatch(documentActions.loadAll());
	}, [dispatch]);

	const handleNewDocument = useCallback((): void => {
		void (async (): Promise<void> => {
			await navigate(AppRoute.DOCUMENTS_NEW);
		})();
	}, [navigate]);

	const handleResumeUpload = useCallback(
		(documentId: number) => {
			return (): void => {
				void (async (): Promise<void> => {
					try {
						await navigate(AppRoute.DOCUMENTS_NEW, {
							state: { documentId },
						});
					} catch (error: unknown) {
						// eslint-disable-next-line no-console
						console.error(error);
					}
				})();
			};
		},
		[navigate],
	);

	const isLoading = dataStatus === DataStatus.PENDING;
	const isEmpty = !isLoading && documents.length === EMPTY_LENGTH;

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading documents" />}

			<h1>Documents</h1>

			<Button label="+ New document" onClick={handleNewDocument} />

			{isEmpty && (
				<div>
					<h2>No documents yet</h2>
					<p>Upload a PDF and start verifying in about a minute.</p>
					<p>up to 500 MB · up to 500 pages</p>
				</div>
			)}

			{!isEmpty && (
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Status</th>
							<th>Uploaded</th>
							<th>Pages</th>
						</tr>
					</thead>
					<tbody>
						{documents.map((document) => (
							<tr key={document.id}>
								<td>{document.title}</td>
								<td>
									<StatusChip status={document.status} />
									{(document.status === DocumentStatus.DRAFT ||
										document.status === DocumentStatus.FAILED) && (
										<Button
											label="Resume upload"
											onClick={handleResumeUpload(document.id)}
											type="button"
										/>
									)}
								</td>
								<td>{new Date(document.createdAt).toLocaleDateString()}</td>
								<td>{document.pageCount}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);
};

export { Documents };
