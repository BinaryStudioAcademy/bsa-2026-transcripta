import {
	HTTPCode,
	HTTPError,
	type PresetCreateRequestDto,
	type PresetCreateResponseDto,
	type PresetGetAllResponseDto,
	PresetValidationMessage,
} from "@transcripta/shared";
import { UniqueViolationError } from "objection";

import { DEFAULT_PRESET_SETTINGS } from "~/modules/context/builder/libs/constants/constants.js";
import { validateSeedGlossaryBudget } from "~/modules/context/context.js";

import { VERSION_INCREMENT } from "./libs/constants/constants.js";
import { PresetErrorMessage } from "./libs/enums/enums.js";
import { PresetEntity } from "./preset.entity.js";
import { type PresetRepository } from "./preset.repository.js";

type PresetCreateServicePayload = PresetCreateRequestDto & {
	ownerId: number;
};

class PresetService {
	private presetRepository: PresetRepository;

	public constructor(presetRepository: PresetRepository) {
		this.presetRepository = presetRepository;
	}

	public async create({
		description = "",
		familyId,
		instructions,
		name,
		ownerId,
		seedGlossary = [],
		settings = {},
	}: PresetCreateServicePayload): Promise<PresetCreateResponseDto> {
		const base = await this.presetRepository.findAccessibleBase(
			familyId,
			ownerId,
		);

		if (!base) {
			throw new HTTPError({
				message: PresetValidationMessage.PRESET_NOT_FOUND,
				status: HTTPCode.NOT_FOUND,
			});
		}

		const { maxContextTokens, model } = {
			...DEFAULT_PRESET_SETTINGS,
			...settings,
		} as { maxContextTokens: number; model: string };

		const budgetCheck = await validateSeedGlossaryBudget({
			maxContextTokens,
			model,
			seedGlossary,
		});

		if (!budgetCheck.ok) {
			throw new HTTPError({
				message: budgetCheck.message,
				status: HTTPCode.UNPROCESSED_ENTITY,
			});
		}

		const entity = PresetEntity.initializeNew({
			description,
			familyId: base.getFamilyId(),
			instructions,
			isPublic: false,
			name,
			outputSchema: structuredClone(base.getOutputSchema()),
			ownerId,
			seedGlossary,
			settings,
			version: base.getVersion() + VERSION_INCREMENT,
		});

		try {
			const created = await this.presetRepository.create(entity);

			return created.toCreateResponseObject();
		} catch (error) {
			if (
				error instanceof UniqueViolationError &&
				error.constraint === "preset_version_unique"
			) {
				throw new HTTPError({
					message: PresetErrorMessage.VERSION_ALREADY_EXISTS,
					status: HTTPCode.CONFLICT,
				});
			}

			throw error;
		}
	}

	public async findAllByUserId(
		userId: number,
	): Promise<PresetGetAllResponseDto> {
		const items = await this.presetRepository.findAllByUserId(userId);

		return {
			items: items.map((item) => item.toObject()),
		};
	}
}

export { PresetService };
