import {
	DocumentExportGetByIdParametersValidationSchema,
	DocumentExportsApiPath,
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

import { type DocumentExportService } from "./document-export.service.js";

type GetExportByIdHandlerOptions = APIHandlerOptions<{
	params: {
		id: number;
	};
	user: TokenPayload;
}>;

class DocumentExportController extends BaseController {
	private documentExportService: DocumentExportService;

	public constructor(
		logger: Logger,
		documentExportService: DocumentExportService,
	) {
		super(logger, APIPath.EXPORTS);
		this.documentExportService = documentExportService;

		this.addRoute({
			handler: (options) =>
				this.getById(options as GetExportByIdHandlerOptions),
			method: HTTPMethod.GET,
			path: DocumentExportsApiPath.BY_ID,
			preHandler: authGuard,
			validation: {
				params: DocumentExportGetByIdParametersValidationSchema,
			},
		});
	}

	/**
	 * @swagger
	 * /exports/{id}:
	 *   get:
	 *     description: Get export status, metadata, and presigned download URL when ready
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         description: Export ID
	 *         required: true
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *     responses:
	 *       200:
	 *         description: Export metadata with status and download URL if ready
	 *       401:
	 *         description: Unauthorized
	 *       404:
	 *         description: Export not found or caller is not owner
	 */
	private async getById(
		options: GetExportByIdHandlerOptions,
	): Promise<APIHandlerResponse> {
		const payload = await this.documentExportService.getById(
			options.params.id,
			options.user.userId,
		);

		return {
			payload,
			status: HTTPCode.OK,
		};
	}
}

export { DocumentExportController };
