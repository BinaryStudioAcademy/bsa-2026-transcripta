import { HTTPCode, HTTPError } from "@transcripta/shared";
import { UniqueViolationError } from "objection";

import { type BaseEncryption } from "~/libs/modules/encryption/base-encryption.module.js";
import { type TokenServiceInterface } from "~/libs/modules/token/token.js";
import { type Service } from "~/libs/types/types.js";
import { UserEntity } from "~/modules/users/user.entity.js";
import { type UserRepository } from "~/modules/users/user.repository.js";

import { UserErrorMessage } from "./libs/enums/enums.js";
import {
	type UserGetAllResponseDto,
	type UserSignUpRequestDto,
	type UserSignUpResponseDto,
} from "./libs/types/types.js";

class UserService implements Service {
	private encryption: BaseEncryption;
	private token: TokenServiceInterface;
	private userRepository: UserRepository;

	public constructor(
		userRepository: UserRepository,
		encryption: BaseEncryption,
		token: TokenServiceInterface,
	) {
		this.userRepository = userRepository;
		this.encryption = encryption;
		this.token = token;
	}

	public async create(
		payload: UserSignUpRequestDto,
	): Promise<UserSignUpResponseDto> {
		const salt = this.encryption.generateSalt();
		const hash = await this.encryption.hash(payload.password, salt);

		try {
			const item = await this.userRepository.create(
				UserEntity.initializeNew({
					email: payload.email,
					passwordHash: hash,
					passwordSalt: salt,
				}),
			);

			const user = item.toObject();
			const token = await this.token.create({ userId: user.id });

			return { token, user };
		} catch (error) {
			if (error instanceof UniqueViolationError) {
				throw new HTTPError({
					message: UserErrorMessage.USER_EMAIL_IN_USE,
					status: HTTPCode.CONFLICT,
				});
			}
			throw error;
		}
	}

	public delete(): ReturnType<Service["delete"]> {
		return Promise.resolve(true);
	}

	public find(): ReturnType<Service["find"]> {
		return Promise.resolve(null);
	}

	public async findAll(): Promise<UserGetAllResponseDto> {
		const items = await this.userRepository.findAll();

		return {
			items: items.map((item) => item.toObject()),
		};
	}

	public async findByEmail(email: string): Promise<null | UserEntity> {
		return await this.userRepository.findByEmail(email);
	}

	public update(): ReturnType<Service["update"]> {
		return Promise.resolve(null);
	}
}

export { UserService };
