import { type PDFPageProcessor } from "~/libs/modules/pdf-page-processor/pdf-page-processor.module.js";
import { type DocumentExportQueue } from "~/libs/modules/queue/document-export/document-export-queue.module.js";
import { type PageTranscribeQueue } from "~/libs/modules/queue/page-transcribe-queue.module.js";
import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";
import { type DocumentExportRepository } from "~/modules/document-exports/document-export.repository.js";
import { type PageRepository } from "~/modules/pages/page.repository.js";

import { type DocumentRepository } from "../../document.repository.js";

type DocumentServiceDependencies = {
	documentExportQueue: DocumentExportQueue;
	documentExportRepository: DocumentExportRepository;
	documentRepository: DocumentRepository;
	pageRepository: PageRepository;
	pageTranscribeQueue: PageTranscribeQueue;
	pdfPageProcessor: PDFPageProcessor;
	storage: BaseStorage;
};

export { DocumentServiceDependencies };
