import {
	APIPath,
	HTTPCode,
	HTTPMethod,
	PresetsApiPath,
} from "@transcripta/shared";

import { authGuard } from "~/libs/modules/auth/auth.js";
import {
	type APIHandlerOptions,
	type APIHandlerResponse,
	BaseController,
} from "~/libs/modules/controller/controller.js";
import { type Logger } from "~/libs/modules/logger/logger.js";
import { type TokenPayload } from "~/libs/modules/token/token.js";

import { type PresetService } from "./preset.service.js";

type PresetFindAllOptions = APIHandlerOptions<{
	user: TokenPayload;
}>;

/*** @swagger
 * components:
 *   schemas:
 *     PresetGetAllItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     PresetGetAllResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/PresetGetAllItemResponse"
 */
class PresetController extends BaseController {
	private presetService: PresetService;

	public constructor(logger: Logger, presetService: PresetService) {
		super(logger, APIPath.PRESETS);

		this.presetService = presetService;

		this.addRoute({
			handler: (options) => this.findAll(options as PresetFindAllOptions),
			method: HTTPMethod.GET,
			path: PresetsApiPath.ROOT,
			preHandler: authGuard,
		});
	}

	/**
	 * @swagger
	 * /presets:
	 *    get:
	 *      description: Returns built-in presets plus the caller's own
	 *      security:
	 *        - bearerAuth: []
	 *      responses:
	 *        200:
	 *          description: Successful operation
	 *          content:
	 *            application/json:
	 *              schema:
	 *                $ref: "#/components/schemas/PresetGetAllResponse"
	 *        401:
	 *          description: Unauthorized
	 */
	private async findAll(
		options: PresetFindAllOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.presetService.findAllByUserId(options.user.userId),
			status: HTTPCode.OK,
		};
	}
}

export { PresetController };
