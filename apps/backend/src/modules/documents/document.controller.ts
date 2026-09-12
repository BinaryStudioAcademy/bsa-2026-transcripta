import {
	type DocumentCreateRequestDto,
	DocumentCreateValidationSchema,
	type DocumentGetByIdParametersDto,
	DocumentGetByIdParametersValidationSchema,
	type DocumentGetPagesQueryDto,
	DocumentGetPagesQueryValidationSchema,
	type DocumentIdRequestDto,
	DocumentIdValidationSchema,
	type DocumentUploadUrlRequestDto,
	DocumentUploadUrlValidationSchema,
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
import {
	type DocumentDeleteOptions,
	type DocumentIdHandlerOptions,
} from "./libs/types/types.js";

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

type DocumentFindByIdOptions = APIHandlerOptions<{
	params: DocumentGetByIdParametersDto;
	user: TokenPayload;
}>;

type DocumentFindPagesOptions = APIHandlerOptions<{
	params: DocumentGetByIdParametersDto;
	query: DocumentGetPagesQueryDto;
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
			handler: (options) => this.findById(options as DocumentFindByIdOptions),
			method: HTTPMethod.GET,
			path: DocumentsApiPath.BY_ID,
			preHandler: authGuard,
			validation: {
				params: DocumentGetByIdParametersValidationSchema,
			},
		});

		this.addRoute({
			handler: (options) => this.findPages(options as DocumentFindPagesOptions),
			method: HTTPMethod.GET,
			path: DocumentsApiPath.BY_ID_PAGES,
			preHandler: authGuard,
			validation: {
				params: DocumentGetByIdParametersValidationSchema,
				query: DocumentGetPagesQueryValidationSchema,
			},
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
			path: DocumentsApiPath.BY_ID,
			preHandler: authGuard,
			validation: {
				params: DocumentIdValidationSchema,
			},
		});

		this.addRoute({
			handler: (options) =>
				this.getUploadUrl(
					options as APIHandlerOptions<{
						body?: DocumentUploadUrlRequestDto;
						params: DocumentIdRequestDto;
						user: TokenPayload;
					}>,
				),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.UPLOAD_URL,
			preHandler: authGuard,
			validation: {
				body: DocumentUploadUrlValidationSchema,
				params: DocumentIdValidationSchema,
			},
		});

		this.addRoute({
			handler: (this.ingest as APIHandler).bind(this),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.INGEST,
			preHandler: authGuard,
		});

		this.addRoute({
			handler: (this.pause as APIHandler).bind(this),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.PAUSE,
			preHandler: authGuard,
			validation: {
				params: DocumentGetByIdParametersValidationSchema,
			},
		});

		this.addRoute({
			handler: (this.resume as APIHandler).bind(this),
			method: HTTPMethod.POST,
			path: DocumentsApiPath.RESUME,
			preHandler: authGuard,
			validation: {
				params: DocumentGetByIdParametersValidationSchema,
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

	/**
	 * @swagger
	 * /documents/{id}:
	 *    get:
	 *      description: Returns document details with progress and budget
	 *      security:
	 *        - bearerAuth: []
	 *      parameters:
	 *        - in: path
	 *          name: id
	 *          required: true
	 *          schema:
	 *            type: integer
	 *            minimum: 1
	 *      responses:
	 *        200:
	 *          description: Successful operation
	 *        404:
	 *          description: Document not found
	 */
	private async findById(
		options: DocumentFindByIdOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.findById(
				options.params.id,
				options.user.userId,
			),
			status: HTTPCode.OK,
		};
	}

	/**
	 * @swagger
	 * /documents/{id}/pages:
	 *    get:
	 *      description: Returns paginated pages with transcriptions and image URLs
	 *      security:
	 *        - bearerAuth: []
	 *      parameters:
	 *        - in: path
	 *          name: id
	 *          required: true
	 *          schema:
	 *            type: integer
	 *            minimum: 1
	 *        - in: query
	 *          name: from
	 *          required: false
	 *          schema:
	 *            type: integer
	 *            minimum: 1
	 *            default: 1
	 *        - in: query
	 *          name: limit
	 *          required: false
	 *          schema:
	 *            type: integer
	 *            minimum: 1
	 *            maximum: 50
	 *            default: 20
	 *      responses:
	 *        200:
	 *          description: Successful operation
	 *        404:
	 *          description: Document not found
	 */
	private async findPages(
		options: DocumentFindPagesOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.findPages({
				documentId: options.params.id,
				from: options.query.from,
				limit: options.query.limit,
				ownerId: options.user.userId,
			}),
			status: HTTPCode.OK,
		};
	}

	/**
	 * @swagger
	 * /documents/{id}/upload-url:
	 *   post:
	 *     description: Get a fresh presigned upload URL for a draft or failed document
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *         description: Document ID
	 *     requestBody:
	 *       required: false
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               title:
	 *                 type: string
	 *               presetId:
	 *                 type: number
	 *               fileName:
	 *                 type: string
	 *               fileBytes:
	 *                 type: number
	 *     responses:
	 *       200:
	 *         description: Fresh upload URL generated successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 uploadUrl:
	 *                   type: string
	 *                 expiresAt:
	 *                   type: string
	 *       404:
	 *         description: Document not found
	 *       409:
	 *         description: Document is not in draft status
	 */
	private async getUploadUrl(
		options: APIHandlerOptions<{
			body?: DocumentUploadUrlRequestDto;
			params: DocumentIdRequestDto;
			user: TokenPayload;
		}>,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.documentService.getUploadUrl(
				options.params.id,
				options.user.userId,
				options.body,
			),
			status: HTTPCode.OK,
		};
	}

	/**
	 * @swagger
	 * /documents/{id}/ingest:
	 *   post:
	 *     description: Ingest a PDF document - split it into pages
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: Document ID
	 *     responses:
	 *       200:
	 *         description: Successful operation
	 *       409:
	 *         description: Document is currently ingesting
	 *       404:
	 *         description: Document not found
	 *       413:
	 *         description: Document is too large
	 *       500:
	 *         description: Other errors
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
	/**
	 * @swagger
	 * /documents/{id}/pause:
	 *   post:
	 *     description: Set the document to paused
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: Document ID
	 *     responses:
	 *       200:
	 *         description: Successful operation
	 *       404:
	 *         description: Document not found
	 *       409:
	 *         description: Document cannot be paused from its current status
	 *       500:
	 *         description: Other errors
	 */
	private async pause(
		options: DocumentIdHandlerOptions,
	): Promise<APIHandlerResponse> {
		await this.documentService.pause(options.params.id, options.user.userId);
		return {
			payload: null,
			status: HTTPCode.OK,
		};
	}
	/**
	 * @swagger
	 * /documents/{id}/resume:
	 *   post:
	 *     description: Back to processing, and re-enqueue what still needs work
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: Document ID
	 *     responses:
	 *       200:
	 *         description: Successful operation
	 *       404:
	 *         description: Document not found
	 *       409:
	 *         description: Document cannot be resumed from its current status
	 *       500:
	 *         description: Other errors
	 */
	private async resume(
		options: DocumentIdHandlerOptions,
	): Promise<APIHandlerResponse> {
		await this.documentService.resume(options.params.id, options.user.userId);
		return {
			payload: null,
			status: HTTPCode.OK,
		};
	}
}

export { DocumentController };
