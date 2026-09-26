import {
	type DocumentExportFormatValue,
	type DocumentExportStatusValue,
} from "@transcripta/shared";

class DocumentExportEntity {
	private createdAt: string;
	private documentId: number;
	private errorMessage: null | string;
	private finishedAt: null | string;
	private format: DocumentExportFormatValue;
	private id: null | number;
	private objectKey: null | string;
	private requestedBy: number;
	private sizeBytes: null | number;
	private status: DocumentExportStatusValue;
	private updatedAt: string;

	private constructor({
		createdAt,
		documentId,
		errorMessage,
		finishedAt,
		format,
		id,
		objectKey,
		requestedBy,
		sizeBytes,
		status,
		updatedAt,
	}: {
		createdAt: string;
		documentId: number;
		errorMessage: null | string;
		finishedAt: null | string;
		format: DocumentExportFormatValue;
		id: null | number;
		objectKey: null | string;
		requestedBy: number;
		sizeBytes: null | number;
		status: DocumentExportStatusValue;
		updatedAt: string;
	}) {
		this.createdAt = createdAt;
		this.documentId = documentId;
		this.errorMessage = errorMessage;
		this.finishedAt = finishedAt;
		this.format = format;
		this.id = id;
		this.objectKey = objectKey;
		this.requestedBy = requestedBy;
		this.sizeBytes = sizeBytes;
		this.status = status;
		this.updatedAt = updatedAt;
	}

	public static initialize({
		createdAt,
		documentId,
		errorMessage,
		finishedAt,
		format,
		id,
		objectKey,
		requestedBy,
		sizeBytes,
		status,
		updatedAt,
	}: {
		createdAt: string;
		documentId: number;
		errorMessage?: null | string;
		finishedAt?: null | string;
		format: DocumentExportFormatValue;
		id: number;
		objectKey?: null | string;
		requestedBy: number;
		sizeBytes?: null | number;
		status: DocumentExportStatusValue;
		updatedAt: string;
	}): DocumentExportEntity {
		return new DocumentExportEntity({
			createdAt,
			documentId,
			errorMessage: errorMessage ?? null,
			finishedAt: finishedAt ?? null,
			format,
			id,
			objectKey: objectKey ?? null,
			requestedBy,
			sizeBytes: sizeBytes ?? null,
			status,
			updatedAt,
		});
	}

	public static initializeNew({
		documentId,
		format,
		requestedBy,
		status,
	}: {
		documentId: number;
		format: DocumentExportFormatValue;
		requestedBy: number;
		status: DocumentExportStatusValue;
	}): DocumentExportEntity {
		return new DocumentExportEntity({
			createdAt: "",
			documentId,
			errorMessage: null,
			finishedAt: null,
			format,
			id: null,
			objectKey: null,
			requestedBy,
			sizeBytes: null,
			status,
			updatedAt: "",
		});
	}

	public toNewObject(): {
		documentId: number;
		errorMessage: null | string;
		finishedAt: null | string;
		format: DocumentExportFormatValue;
		objectKey: null | string;
		requestedBy: number;
		sizeBytes: null | number;
		status: DocumentExportStatusValue;
	} {
		return {
			documentId: this.documentId,
			errorMessage: this.errorMessage,
			finishedAt: this.finishedAt,
			format: this.format,
			objectKey: this.objectKey,
			requestedBy: this.requestedBy,
			sizeBytes: this.sizeBytes,
			status: this.status,
		};
	}

	public toObject(): {
		createdAt: string;
		documentId: number;
		errorMessage: null | string;
		finishedAt: null | string;
		format: DocumentExportFormatValue;
		id: number;
		objectKey: null | string;
		requestedBy: number;
		sizeBytes: null | number;
		status: DocumentExportStatusValue;
		updatedAt: string;
	} {
		return {
			createdAt: this.createdAt,
			documentId: this.documentId,
			errorMessage: this.errorMessage,
			finishedAt: this.finishedAt,
			format: this.format,
			id: this.id as number,
			objectKey: this.objectKey,
			requestedBy: this.requestedBy,
			sizeBytes: this.sizeBytes,
			status: this.status,
			updatedAt: this.updatedAt,
		};
	}
}

export { DocumentExportEntity };
