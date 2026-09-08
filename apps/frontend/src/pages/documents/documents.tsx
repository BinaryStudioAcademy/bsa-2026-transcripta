import { useCallback, useState } from "react";

import {
	Button,
	ConfirmDialog,
	LoaderOverlay,
	OverflowMenu,
	StatusChip,
} from "~/libs/components/components.js";
import { DataStatus } from "~/libs/enums/enums.js";
import {
	useAppDispatch,
	useAppSelector,
	useEffect,
} from "~/libs/hooks/hooks.js";
import { actions as documentActions } from "~/modules/documents/documents.js";

const EMPTY_LENGTH = 0;

const Documents: React.FC = () => {
	const dispatch = useAppDispatch();
	const { dataStatus, documents } = useAppSelector(({ documents }) => ({
		dataStatus: documents.dataStatus,
		documents: documents.documents,
	}));
	const [pendingDeleteId, setPendingDeleteId] = useState<null | number>(null);

	useEffect(() => {
		void dispatch(documentActions.loadAll());
	}, [dispatch]);

	const isLoading = dataStatus === DataStatus.PENDING;
	const isEmpty = !isLoading && documents.length === EMPTY_LENGTH;

	const handleCancelDelete = useCallback((): void => {
		setPendingDeleteId(null);
	}, []);

	const handleConfirmDelete = useCallback((): void => {
		if (pendingDeleteId === null) {
			return;
		}

		void dispatch(documentActions.remove(pendingDeleteId));
		setPendingDeleteId(null);
	}, [dispatch, pendingDeleteId]);

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
							<th />
						</tr>
					</thead>
					<tbody>
						{documents.map((document) => {
							const handleDeleteClick = (): void => {
								setPendingDeleteId(document.id);
							};

							return (
								<tr key={document.id}>
									<td>{document.title}</td>
									<td>
										<StatusChip status={document.status} />
									</td>
									<td>{new Date(document.createdAt).toLocaleDateString()}</td>
									<td>{document.pageCount}</td>
									<td>
										<OverflowMenu
											items={[
												{
													isDanger: true,
													label: "Delete",
													onClick: handleDeleteClick,
												},
											]}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			{pendingDeleteId !== null && (
				<ConfirmDialog
					description="The transcription goes with it. This can't be undone."
					onCancel={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete this document"
				/>
			)}
		</>
	);
};

export { Documents };
