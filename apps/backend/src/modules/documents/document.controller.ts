import {
	type DocumentCreateRequestDto,
	DocumentCreateValidationSchema,
	type DocumentIdRequestDto,
	DocumentIdValidationSchema,
} from "@transcripta/shared";

import { APIPath } from "~/libs/enums/enums.js";
import { authGuard } from "~/libs/modules/auth/auth.js";
import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { HTTPCode, HTTPMethod } from "~/libs/modules/http/http.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";
import { type DocumentService } from "~/modules/documents/document.service.js";

import { DocumentsApiPath } from "./libs/enums/enums.js";

/*** @swagger
 * components:
 *   schemas:
 *     DocumentCreateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         presetId:
 *           type: number
 *           format: number
 *           minimum: 1
 *         fileName:
 *           type: string
 *         fileBytes:
 *           type: number
 *           format: number
 *           minimum: 1
 *           maximum: 524288000
 *     DocumentCreateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         title:
 *           type: string
 *         status:
 *           type: string
 *         uploadUrl:
 *           type: string
 *         expiresAt:
 *           type: string
 *     DocumentGetAllItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           format: number
 *           minimum: 1
 *         title:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - draft
 *             - ingesting
 *             - ready
 *             - processing
 *             - paused
 *             - budget_stop
 *             - done
 *             - failed
 *         pageCount:
 *           type: number
 *           format: number
 *           minimum: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DocumentGetAllResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/DocumentGetAllItem"
 */
type DocumentCreateOptions = APIHandlerOptions<{
	body: DocumentCreateRequestDto;
	user: TokenPayload;
}>;

type DocumentDeleteOptions = APIHandlerOptions<{
	params: DocumentIdRequestDto;
	user: TokenPayload;
}>;

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
			method: HTTPMethod.GET,
			path: DocumentsApiPath.ROOT,
			preHandler: authGuard,
		});

		this.addRoute({
			handler: (options) => this.create(options as DocumentCreateOptions),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.ROOT,
			preHandler: authGuard,
			validation: {
				body: DocumentCreateValidationSchema,
			},
		});

		this.addRoute({
			handler: (options) => this.delete(options as DocumentDeleteOptions),
			method: HTTPMethod.DELETE,
			path: DocumentsApiPath.$ID,
			preHandler: authGuard,
			validation: {
				params: DocumentIdValidationSchema,
			},
		});
	}

	/**
	 * @swagger
	 * /documents:
	 *   post:
	 *     description: Create a new document and get a presigned upload URL
	 *     security:
	 *       - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: "#/components/schemas/DocumentCreateRequest"
	 *     responses:
	 *       201:
	 *         description: Document created successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/DocumentCreateResponse"
	 */
	private async create(
		options: DocumentCreateOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.create({
				...options.body,
				ownerId: options.user.userId,
			}),
			status: HTTPCode.CREATED,
		};
	}

	/**
	 * @swagger
	 * /documents/{id}:
	 *   delete:
	 *     description: Delete a document owned by the current user
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *     responses:
	 *       204:
	 *         description: Document deleted successfully
	 *       404:
	 *         description: Document not found
	 *       409:
	 *         description: Document is currently ingesting or processing
	 */
	private async delete(
		options: DocumentDeleteOptions,
	): Promise<APIHandlerResponse> {
		await this.documentService.delete(options.params.id, options.user.userId);

		return {
			payload: null,
			status: HTTPCode.NO_CONTENT,
		};
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
	 *                $ref: "#/components/schemas/DocumentGetAllResponse"
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
