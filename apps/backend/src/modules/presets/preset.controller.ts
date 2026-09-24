import {
	APIPath,
	HTTPCode,
	HTTPMethod,
	PresetCreateValidationSchema,
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

import { type PresetCreateOptions } from "./libs/types/types.js";
import { type PresetService } from "./preset.service.js";

type PresetFindAllOptions = APIHandlerOptions<{
	user: TokenPayload;
}>;

/*** @swagger
 * components:
 *   schemas:
 *     PresetCreateRequest:
 *       type: object
 *       required:
 *         - familyId
 *         - name
 *         - instructions
 *       properties:
 *         familyId:
 *           type: number
 *           format: number
 *           minimum: 1
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         instructions:
 *           type: string
 *         seedGlossary:
 *           type: array
 *           items: {}
 *         settings:
 *           type: object
 *     PresetCreateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         familyId:
 *           type: number
 *         version:
 *           type: number
 *         ownerId:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         instructions:
 *           type: string
 *         outputSchema:
 *           type: object
 *         seedGlossary:
 *           type: array
 *           items: {}
 *         settings:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PresetGetAllItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         familyId:
 *           type: number
 *         version:
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

		this.addRoute({
			handler: (options) => this.create(options as PresetCreateOptions),
			method: HTTPMethod.POST,
			path: PresetsApiPath.ROOT,
			preHandler: authGuard,
			validation: {
				body: PresetCreateValidationSchema,
			},
		});
	}

	/**
	 * @swagger
	 * /presets:
	 *    post:
	 *      description: Creates a new preset based on an existing one
	 *      security:
	 *        - bearerAuth: []
	 *      requestBody:
	 *        required: true
	 *        content:
	 *          application/json:
	 *            schema:
	 *              $ref: "#/components/schemas/PresetCreateRequest"
	 *      responses:
	 *        201:
	 *          description: Preset created successfully
	 *          content:
	 *            application/json:
	 *              schema:
	 *                $ref: "#/components/schemas/PresetCreateResponse"
	 *        401:
	 *          description: Unauthorized
	 *        404:
	 *          description: Base preset not found or inaccessible
	 *        409:
	 *          description: This preset version already exists
	 *        422:
	 *          description: Seed glossary exceeds the context budget
	 */
	private async create(
		options: PresetCreateOptions,
	): Promise<APIHandlerResponse> {
		return {
			payload: await this.presetService.create({
				...options.body,
				ownerId: options.user.userId,
			}),
			status: HTTPCode.CREATED,
		};
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
