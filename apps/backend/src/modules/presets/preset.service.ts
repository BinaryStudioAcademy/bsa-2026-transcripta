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

import {
	INITIAL_VERSION,
	MAX_PRESET_CREATE_ATTEMPTS,
	VERSION_INCREMENT,
} from "./libs/constants/constants.js";
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

		for (let attempt = 0; attempt < MAX_PRESET_CREATE_ATTEMPTS; attempt++) {
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

			const isOwnBase = base.getOwnerId() === ownerId;

			const entity = PresetEntity.initializeNew({
				description,
				familyId: isOwnBase ? base.getFamilyId() : null,
				instructions,
				isPublic: false,
				name,
				outputSchema: structuredClone(base.getOutputSchema()),
				ownerId,
				seedGlossary,
				settings: { ...base.getSettings(), ...settings },
				version: isOwnBase
					? (await this.presetRepository.findFamilyMaxVersion(
							base.getFamilyId(),
						)) + VERSION_INCREMENT
					: INITIAL_VERSION,
			});

			try {
				const created = await this.presetRepository.create(entity);

				return created.toCreateResponseObject();
			} catch (error) {
				if (
					error instanceof UniqueViolationError &&
					error.constraint === "preset_version_unique"
				) {
					continue;
				}

				throw error;
			}
		}

		throw new HTTPError({
			message: PresetErrorMessage.VERSION_ALREADY_EXISTS,
			status: HTTPCode.CONFLICT,
		});
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
