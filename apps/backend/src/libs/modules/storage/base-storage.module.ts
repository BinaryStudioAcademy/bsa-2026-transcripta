import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { type Config } from "~/libs/modules/config/config.js";

import { SignedUrlConfig } from "./libs/constants/constants.js";
import {
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./libs/types/types.js";

class BaseStorage {
	private bucketUploads: string;
	private client: S3Client;

	public constructor(config: Config) {
		const {
			ACCESS_KEY_ID,
			BUCKET_UPLOADS,
			ENDPOINT,
			REGION,
			SECRET_ACCESS_KEY,
		} = config.ENV.STORAGE;

		this.bucketUploads = BUCKET_UPLOADS;
		this.client = new S3Client({
			credentials: {
				accessKeyId: ACCESS_KEY_ID,
				secretAccessKey: SECRET_ACCESS_KEY,
			},
			endpoint: ENDPOINT,
			forcePathStyle: true,
			region: REGION,
		});
	}

	public async getUploadSignedUrl({
		contentType,
		expiresInSeconds = SignedUrlConfig.SECONDS_IN_HOUR,
		key,
	}: UploadSignedUrlRequest): Promise<UploadSignedUrlResponse> {
		const command = new PutObjectCommand({
			Bucket: this.bucketUploads,
			ContentType: contentType,
			Key: key,
		});

		const url = await getSignedUrl(this.client, command, {
			expiresIn: expiresInSeconds,
		});

		const expiresAt = new Date(
			Date.now() + expiresInSeconds * SignedUrlConfig.MILLISECONDS_IN_SECOND,
		).toISOString();

		return { expiresAt, url };
	}
}

export { BaseStorage };
