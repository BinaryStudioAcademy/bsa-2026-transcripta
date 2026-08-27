import { type DocumentRepository } from "~/modules/documents/document.repository.js";

import { type DocumentListResponseDto } from "./libs/types/types.js";

class DocumentService {
	private documentRepository: DocumentRepository;

	public constructor(documentRepository: DocumentRepository) {
		this.documentRepository = documentRepository;
	}

	public async findAllByOwnerId(
		ownerId: number,
	): Promise<DocumentListResponseDto> {
		const items = await this.documentRepository.findAllByOwnerId(ownerId);

		return {
			items: items.map((item) => item.toObject()),
		};
	}
}

export { DocumentService };
