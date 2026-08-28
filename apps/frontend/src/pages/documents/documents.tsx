import { type ValueOf } from "@transcripta/shared";

import { Button, LoaderOverlay } from "~/libs/components/components.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useEffect,
} from "~/libs/hooks/hooks.js";
import {
	actions as documentActions,
	DocumentStatus,
} from "~/modules/documents/documents.js";

const EMPTY_LENGTH = 0;

const DOCUMENT_STATUS_LABEL: Record<ValueOf<typeof DocumentStatus>, string> = {
	[DocumentStatus.BUDGET_STOP]: "Budget limit",
	[DocumentStatus.DONE]: "Done",
	[DocumentStatus.DRAFT]: "Draft",
	[DocumentStatus.FAILED]: "Failed",
	[DocumentStatus.INGESTING]: "Ingesting",
	[DocumentStatus.PAUSED]: "Paused",
	[DocumentStatus.PROCESSING]: "Processing",
	[DocumentStatus.READY]: "Ready",
};

const Documents: React.FC = () => {
	const dispatch = useAppDispatch();
	const { dataStatus, documents } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		documents: documents.documents,
	}));

	useEffect(() => {
		void dispatch(documentActions.loadAll());
	}, [dispatch]);

	const isLoading = dataStatus === DataStatus.PENDING;
	const isEmpty = !isLoading && documents.length === EMPTY_LENGTH;

	return (
		<>
			{isLoading && <LoaderOverlay label="Loading documents" />}

			<h1>Documents</h1>

			<Button label="+ New document" />

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
								<td>{DOCUMENT_STATUS_LABEL[document.status]}</td>
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
