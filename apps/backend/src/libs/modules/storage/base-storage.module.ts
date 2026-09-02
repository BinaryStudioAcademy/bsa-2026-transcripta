import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { type Config } from "~/libs/modules/config/config.js";

import { SignedUrlConfig } from "./libs/constants/constants.js";
import {
	type Storage,
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./libs/types/types.js";

class BaseStorage implements Storage {
	private bucketPages: string;
	private bucketUploads: string;
	private client: S3Client;
	private config: Config;

	public constructor(config: Config) {
		this.config = config;
		this.bucketPages = config.ENV.STORAGE.BUCKET_PAGES;
		this.bucketUploads = config.ENV.STORAGE.BUCKET_UPLOADS;
		this.client = this.initClient();
	}

	private initClient(): S3Client {
		const { ACCESS_KEY_ID, ENDPOINT, REGION, SECRET_ACCESS_KEY } =
			this.config.ENV.STORAGE;

		return new S3Client({
			credentials: {
				accessKeyId: ACCESS_KEY_ID,
				secretAccessKey: SECRET_ACCESS_KEY,
			},
			endpoint: ENDPOINT,
			forcePathStyle: true,
			region: REGION,
		});
	}

	public async getReadSignedUrl(key: string): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucketPages,
			Key: key,
		});

		return await getSignedUrl(this.client, command, {
			expiresIn: SignedUrlConfig.SECONDS_IN_HOUR,
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
