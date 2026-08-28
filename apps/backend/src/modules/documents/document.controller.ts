import { APIPath } from "~/libs/enums/enums.js";
import { authGuard } from "~/libs/modules/auth/auth.js";
import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { HTTPCode } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";
import { type DocumentService } from "~/modules/documents/document.service.js";

import { DocumentsApiPath } from "./libs/enums/enums.js";

/*** @swagger
 * components:
 *    schemas:
 *      DocumentListItem:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *            format: number
 *            minimum: 1
 *          title:
 *            type: string
 *          status:
 *            type: string
 *            enum:
 *              - draft
 *              - ingesting
 *              - ready
 *              - processing
 *              - paused
 *              - budget_stop
 *              - done
 *              - failed
 *          pageCount:
 *            type: number
 *            format: number
 *            minimum: 0
 *          createdAt:
 *            type: string
 *            format: date-time
 *      DocumentListResponse:
 *        type: object
 *        properties:
 *          items:
 *            type: array
 *            items:
 *              $ref: "#/components/schemas/DocumentListItem"
 */
type DocumentFindAllOptions = APIHandlerOptions<{
	user: TokenPayload;
}>;

class DocumentController extends BaseController {
	private documentService: DocumentService;

	public constructor(logger: Logger, documentService: DocumentService) {
		super(logger, APIPath.DOCUMENTS);

		this.documentService = documentService;

		this.addRoute({
			handler: (options) => this.findAll(options as DocumentFindAllOptions),
			method: "GET",
			path: DocumentsApiPath.ROOT,
			preHandler: authGuard,
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
	 *          content:
	 *            application/json:
	 *              schema:
	 *                $ref: "#/components/schemas/DocumentListResponse"
	 */
	private async findAll(
		options: DocumentFindAllOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.findAllByOwnerId(options.user.userId),
			status: HTTPCode.OK,
		};
	}
}

export { DocumentController };
