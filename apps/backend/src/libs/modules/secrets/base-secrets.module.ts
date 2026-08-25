import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

/**
 * Secrets live in SSM Parameter Store as SecureStrings, not in `.env`:
 * nothing on the box holds them at rest, and rotating one needs no redeploy.
 * Locally this resolves through the developer's AWS profile, on the instance
 * through its IAM role.
 */
class BaseSecrets {
	private cache = new Map<string, string>();

	private client: SSMClient;

	public constructor(region: string) {
		this.client = new SSMClient({ region });
	}

	public async get(name: string): Promise<null | string> {
		const cached = this.cache.get(name);

		if (cached !== undefined) {
			return cached;
		}

		try {
			const response = await this.client.send(
				new GetParameterCommand({ Name: name, WithDecryption: true }),
			);
			const value = response.Parameter?.Value;

			if (value === undefined) {
				return null;
			}

			this.cache.set(name, value);

			return value;
		} catch {
			// A missing parameter is a valid state — the provider that needs it
			// simply stays unavailable, rather than taking the whole app down.
			return null;
		}
	}
}

export { BaseSecrets };
