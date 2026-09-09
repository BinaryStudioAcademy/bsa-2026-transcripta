import {
	BYTES_IN_KILOBYTE,
	DocumentValidationRule,
	KILOBYTES_IN_MEGABYTE,
} from "@transcripta/shared";

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
import {
	DEFAULT_MAX_ARCHIVE_SIZE_MB,
	DEFAULT_MAX_PAGES,
} from "~/pages/document-new/libs/constants/constants.js";

const EMPTY_LENGTH = 0;

const DEFAULT_MAX_FILE_SIZE_MB =
	DocumentValidationRule.MAX_FILE_BYTES /
	(BYTES_IN_KILOBYTE * KILOBYTES_IN_MEGABYTE);

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
					<p>
						PDFs up to {DEFAULT_MAX_FILE_SIZE_MB} MB, ZIPs up to{" "}
						{DEFAULT_MAX_ARCHIVE_SIZE_MB} MB, up to {DEFAULT_MAX_PAGES} pages
					</p>
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
