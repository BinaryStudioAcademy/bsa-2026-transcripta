import { HTTPCode, HTTPError } from "@transcripta/shared";

import { type BaseStorage } from "~/libs/modules/storage/base-storage.module.js";

import { type DocumentExportRepository } from "./document-export.repository.js";
import {
	DocumentExportErrorMessage,
	DocumentExportStatus,
} from "./libs/enums/enums.js";
import { type DocumentExportGetByIdResponseDto } from "./libs/types/types.js";

class DocumentExportService {
	private documentExportRepository: DocumentExportRepository;
	private storage: BaseStorage;

	public constructor({
		documentExportRepository,
		storage,
	}: {
		documentExportRepository: DocumentExportRepository;
		storage: BaseStorage;
	}) {
		this.documentExportRepository = documentExportRepository;
		this.storage = storage;
	}

	public async getById(
		id: number,
		userId: number,
	): Promise<DocumentExportGetByIdResponseDto> {
		const foundExport = await this.documentExportRepository.findByIdAndOwner(
			id,
			userId,
		);

		if (!foundExport) {
			throw new HTTPError({
				message: DocumentExportErrorMessage.EXPORT_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const exportData = foundExport.toObject();
		let downloadUrl: null | string = null;

		if (
			exportData.status === DocumentExportStatus.READY &&
			exportData.objectKey
		) {
			downloadUrl = await this.storage.getExportDownloadSignedUrl(
				exportData.objectKey,
			);
		}

		return {
			...exportData,
			downloadUrl,
		};
	}
}

export { DocumentExportService };
