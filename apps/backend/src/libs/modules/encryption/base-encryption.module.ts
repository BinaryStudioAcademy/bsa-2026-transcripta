import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

class BaseEncryption {
	public compare(
		password: string,
		hash: string,
		salt: string,
	): Promise<boolean> {
		return this.hash(password, salt).then((derivedKey) => {
			const hashBuffer = Buffer.from(hash, "hex");
			const derivedBuffer = Buffer.from(derivedKey, "hex");

			if (hashBuffer.length !== derivedBuffer.length) {
				return false;
			}

			return timingSafeEqual(hashBuffer, derivedBuffer);
		});
	}

	public generateSalt(): string {
		return randomBytes(SALT_LENGTH).toString("hex");
	}

	public hash(password: string, salt: string): Promise<string> {
		return new Promise((resolve, reject) => {
			scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
				if (error) {
					reject(error);

					return;
				}

				resolve(derivedKey.toString("hex"));
			});
		});
	}
}

export { BaseEncryption };
