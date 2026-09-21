import {
	LexiconApiPath,
	type LexiconIdRequestDto,
	LexiconIdValidationSchema,
	type LexiconInvalidateRequestDto,
	LexiconInvalidateValidationSchema,
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

import { type LexiconService } from "./lexicon.service.js";

type InvalidateLexiconOptions = APIHandlerOptions<{
	body: LexiconInvalidateRequestDto;
	params: LexiconIdRequestDto;
	user: TokenPayload;
}>;

class LexiconController extends BaseController {
	private lexiconService: LexiconService;

	public constructor(logger: Logger, lexiconService: LexiconService) {
		super(logger, APIPath.LEXICON);

		this.lexiconService = lexiconService;

		this.addRoute({
			handler: (options) =>
				this.invalidate(options as InvalidateLexiconOptions),
			method: HTTPMethod.POST,
			path: LexiconApiPath.INVALIDATE,
			preHandler: authGuard,
			validation: {
				body: LexiconInvalidateValidationSchema,
				params: LexiconIdValidationSchema,
			},
		});
	}

	/**
	 * @swagger
	 * /lexicon/{id}/invalidate:
	 *   post:
	 *     description: Mark a lexicon word as wrong and requeue affected unconfirmed pages
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
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
	 *               - reason
	 *             properties:
	 *               reason:
	 *                 type: string
	 *                 minLength: 1
	 *     responses:
	 *       200:
	 *         description: Word invalidated; affected pages queued or flagged
	 *       404:
	 *         description: Lexicon entry not found
	 *       409:
	 *         description: Lexicon entry already invalidated
	 */
	private async invalidate(
		options: InvalidateLexiconOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.lexiconService.invalidate({
				lexiconId: options.params.id,
				ownerId: options.user.userId,
				reason: options.body.reason,
			}),
			status: HTTPCode.OK,
		};
	}
}

export { LexiconController };
