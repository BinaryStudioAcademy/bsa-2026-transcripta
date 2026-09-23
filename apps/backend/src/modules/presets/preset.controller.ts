import {
	APIPath,
	HTTPCode,
	HTTPMethod,
	type PresetGetByIdParametersDto,
	PresetGetByIdParametersValidationSchema,
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

type PresetFindByIdOptions = APIHandlerOptions<{
	params: PresetGetByIdParametersDto;
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
 *     PresetGetByIdResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         instructions:
 *           type: string
 *         seedGlossary:
 *           type: array
 *         outputSchema:
 *           type: object
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

		this.addRoute({
			handler: (options) => this.findById(options as PresetFindByIdOptions),
			method: HTTPMethod.GET,
			path: PresetsApiPath.BY_ID,
			preHandler: authGuard,
			validation: {
				params: PresetGetByIdParametersValidationSchema,
			},
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

	/**
	 * @swagger
	 * /presets/{id}:
	 *    get:
	 *      description: Returns full preset details available to the caller
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
	 *          content:
	 *            application/json:
	 *              schema:
	 *                $ref: "#/components/schemas/PresetGetByIdResponse"
	 *        404:
	 *          description: Preset not found
	 */
	private async findById(
		options: PresetFindByIdOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.presetService.findById(
				options.params.id,
				options.user.userId,
			),
			status: HTTPCode.OK,
		};
	}
}

export { PresetController };
