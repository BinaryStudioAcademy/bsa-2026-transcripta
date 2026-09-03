import {
	type DocumentCreateRequestDto,
	DocumentCreateValidationSchema,
} from "@transcripta/shared";

import { APIPath } from "~/libs/enums/enums.js";
import { authGuard } from "~/libs/modules/auth/auth.js";
import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { type APIHandler } from "~/libs/modules/controller/libs/types/types.js";
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
			handler: (this.ingest as APIHandler).bind(this),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.INGEST,
			preHandler: authGuard,
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

	/**
	 * @swagger
	 * /documents/{id}/ingest:
	 *    post:
	 *      description: Ingest a PDF document - split it into pages
	 *      security:
	 *        - bearerAuth: []
	 *      responses:
	 *        200:
	 *          description: Successful operation
	 */
	private async ingest(
		options: APIHandlerOptions<{
			params: {
				id: number;
			};
			user: TokenPayload;
		}>,
	): Promise<APIHandlerResponse> {
		await this.documentService.ingest(options.params.id, options.user.userId);

		return {
			payload: null,
			status: HTTPCode.OK,
		};
	}
}

export { DocumentController };
