import { PageStatus } from "@transcripta/shared";
import { type Job } from "bullmq";

import { type Logger } from "~/libs/modules/logger/logger.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type DocumentExportRepository } from "~/modules/document-exports/document-export.repository.js";
import { type DocumentRepository } from "~/modules/documents/document.repository.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";

import { EXPORTS_FOLDER, UTF8 } from "./libs/constants/constants.js";
import { ErrorMessage, InfoMessage } from "./libs/enums/enums.js";
import { ContentType, Serializers } from "./libs/mappers/mappers.js";
import {
	type DocumentExportJobData,
	type PageItem,
} from "./libs/types/types.js";

const createDocumentExportHandler = ({
	documentExportRepository,
	documentRepository,
	logger,
	pageRepository,
	storage,
}: {
	documentExportRepository: DocumentExportRepository;
	documentRepository: DocumentRepository;
	logger: Logger;
	pageRepository: PageRepository;
	storage: BaseStorage;
}) => {
	return async (job: Job<DocumentExportJobData>): Promise<void> => {
		const { documentId, exportId, format } = job.data;
		try {
			const document = await documentRepository.findById(documentId);

			if (!document) {
				logger.error(ErrorMessage.DOCUMENT_NOT_FOUND(documentId));
				return;
			}

			const pages = await pageRepository.findAllByDocumentId(documentId);

			const pageItems: PageItem[] = pages.map((page) => {
				const text =
					page.status === PageStatus.FAILED
						? ""
						: (page.transcriptionText ?? "");

				return {
					page: page.pageNo,
					status: page.status,
					text,
				};
			});

			const serializer = Serializers[format];
			const fileContent = serializer(pageItems);
			const fileToUpload = Buffer.from(fileContent, UTF8);

			const uploadKey = `${EXPORTS_FOLDER}/${documentId.toString()}/${exportId.toString()}.${format}`;

			await storage.uploadExport({
				body: fileToUpload,
				contentType: ContentType[format],
				key: uploadKey,
			});

			const finishedAt = new Date().toISOString();

			await documentExportRepository.setReady({
				finishedAt,
				id: exportId,
				objectKey: uploadKey,
				sizeBytes: fileToUpload.byteLength,
			});

			logger.info(InfoMessage.EXPORT_FINISHED(exportId));
		} catch (error) {
			const finishedAt = new Date().toISOString();
			const errorMessage =
				error instanceof Error && error.message ? error.message : String(error);

			logger.error(ErrorMessage.EXPORT_FAILED(exportId, documentId), { error });

			await documentExportRepository.setFailed({
				errorMessage,
				finishedAt,
				id: exportId,
			});
		}
	};
};

export { createDocumentExportHandler };
