import { APIPath } from "~/libs/enums/enums.js";
import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { HTTPCode } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type DocumentService } from "~/modules/documents/document.service.js";

import { DocumentsApiPath } from "./libs/enums/enums.js";

type DocumentFindAllOptions = APIHandlerOptions & {
	user: {
		id: number;
	};
};

class DocumentController extends BaseController {
	private documentService: DocumentService;

	public constructor(logger: Logger, documentService: DocumentService) {
		super(logger, APIPath.DOCUMENTS);

		this.documentService = documentService;

		this.addRoute({
			handler: (options) => this.findAll(options as DocumentFindAllOptions),
			method: "GET",
			path: DocumentsApiPath.ROOT,
		});
	}

	/**
	 * @swagger
	 * /documents:
	 *    get:
	 *      description: Returns documents owned by the current user
	 *      security:
	 *        - bearerAuth: []
	 *      responses:
	 *        200:
	 *          description: Successful operation
	 */
	private async findAll(
		options: DocumentFindAllOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.findAllByOwnerId(options.user.id),
			status: HTTPCode.OK,
		};
	}
}

export { DocumentController };
