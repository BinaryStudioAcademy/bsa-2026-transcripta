import {
	DeleteObjectsCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { type Config } from "~/libs/modules/config/config.js";

import {
	DELETE_OBJECTS_BATCH_SIZE,
	SignedUrlConfig,
} from "./libs/constants/constants.js";
import { StorageBucket } from "./libs/enums/enums.js";
import {
	type DeleteByPrefixRequest,
	type Storage,
	type UploadSignedUrlRequest,
	type UploadSignedUrlResponse,
} from "./libs/types/types.js";

class BaseStorage implements Storage {
	private buckets: Record<
		(typeof StorageBucket)[keyof typeof StorageBucket],
		string
	>;
	private client: S3Client;
	private config: Config;

	public constructor(config: Config) {
		this.config = config;
		this.buckets = {
			[StorageBucket.PAGES]: config.ENV.STORAGE.BUCKET_PAGES,
			[StorageBucket.UPLOADS]: config.ENV.STORAGE.BUCKET_UPLOADS,
		};
		this.client = this.initClient();
	}

	private async deleteObjects(bucket: string, keys: string[]): Promise<void> {
		for (
			let index = 0;
			index < keys.length;
			index += DELETE_OBJECTS_BATCH_SIZE
		) {
			const batch = keys.slice(index, index + DELETE_OBJECTS_BATCH_SIZE);
			const response = await this.client.send(
				new DeleteObjectsCommand({
					Bucket: bucket,
					Delete: {
						Objects: batch.map((key) => ({ Key: key })),
						Quiet: true,
					},
				}),
			);

			if (response.Errors?.length) {
				throw new Error("Failed to delete one or more storage objects.");
			}
		}
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

	private async listObjectKeys(
		bucket: string,
		prefix: string,
	): Promise<string[]> {
		const keys: string[] = [];
		let continuationToken: string | undefined;

		do {
			const response = await this.client.send(
				new ListObjectsV2Command({
					Bucket: bucket,
					ContinuationToken: continuationToken,
					Prefix: prefix,
				}),
			);

			for (let object of response.Contents ?? []) {
				if (object.Key) {
					keys.push(object.Key);
				}
			}

			continuationToken = response.NextContinuationToken;

			if (response.IsTruncated && !continuationToken) {
				throw new Error("Storage listing did not return a continuation token.");
			}
		} while (continuationToken);

		return keys;
	}

	public async deleteByPrefix({
		bucket,
		prefix,
	}: DeleteByPrefixRequest): Promise<void> {
		const bucketName = this.buckets[bucket];
		const keys = await this.listObjectKeys(bucketName, prefix);

		await this.deleteObjects(bucketName, keys);
	}

	public async getUploadSignedUrl({
		contentType,
		expiresInSeconds = SignedUrlConfig.SECONDS_IN_HOUR,
		key,
	}: UploadSignedUrlRequest): Promise<UploadSignedUrlResponse> {
		const command = new PutObjectCommand({
			Bucket: this.buckets[StorageBucket.UPLOADS],
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
