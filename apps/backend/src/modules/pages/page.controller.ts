import {
	PageApiPath,
	verifyPage,
	verifyPageParameters,
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

import { type VerifyPageHandlerOptions } from "./libs/types/types.js";
import { type PageService } from "./page.service.js";

type UndoPageHandlerOptions = APIHandlerOptions<{
	params: {
		id: number;
	};
	user: TokenPayload;
}>;

class PageController extends BaseController {
	private pageService: PageService;

	public constructor(logger: Logger, pageService: PageService) {
		super(logger, APIPath.PAGES);

		this.pageService = pageService;

		this.addRoute({
			handler: (options) => this.verify(options as VerifyPageHandlerOptions),
			method: HTTPMethod.POST,
			path: PageApiPath.VERIFY,
			preHandler: authGuard,
			validation: {
				body: verifyPage,
				params: verifyPageParameters,
			},
		});

		if (process.env["NODE_ENV"] !== "production") {
			this.addRoute({
				handler: (options) => this.undo(options as UndoPageHandlerOptions),
				method: HTTPMethod.POST,
				path: PageApiPath.UNDO,
				preHandler: authGuard,
				validation: {
					params: verifyPageParameters,
				},
			});
		}
	}
	/**
	 * @swagger
	 * /pages/{id}/undo:
	 *   post:
	 *     description: Undo the last verification of a page (local mock, dev only)
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         description: Page ID
	 *         required: true
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *     responses:
	 *       200:
	 *         description: Page verification undone
	 *       404:
	 *         description: Page not found
	 */
	private async undo(
		options: UndoPageHandlerOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.pageService.undo(
				options.params.id,
				options.user.userId,
			),
			status: HTTPCode.OK,
		};
	}

	/**
	 * @swagger
	 * /pages/{id}/verify:
	 *   post:
	 *     description: Verify a transcribed page
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         description: Page ID
	 *         required: true
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - action
	 *               - transcriptionId
	 *               - text
	 *               - durationMs
	 *             properties:
	 *               action:
	 *                 type: string
	 *                 enum:
	 *                   - confirm
	 *                   - correct
	 *                   - skip
	 *               transcriptionId:
	 *                 type: integer
	 *               text:
	 *                 type: string
	 *               durationMs:
	 *                 type: integer
	 *                 minimum: 0
	 *     responses:
	 *       200:
	 *         description: Page verified successfully
	 *       404:
	 *         description: Page not found
	 *       409:
	 *         description: Transcription is no longer current
	 */
	private async verify(
		options: VerifyPageHandlerOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.pageService.verify({
				...options.body,
				pageId: options.params.id,
				userId: options.user.userId,
			}),
			status: HTTPCode.OK,
		};
	}
}

export { PageController };
