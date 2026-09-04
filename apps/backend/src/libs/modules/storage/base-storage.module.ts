import {
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { type Config } from "~/libs/modules/config/config.js";

import {
	DELETE_OBJECTS_BATCH_SIZE,
	SignedUrlConfig,
  TMPDIR_PREFIX,
	TMPFILE_NAME,
} from "./libs/constants/constants.js";
import {
	ContentType,
	StorageBucket,
	StorageErrorMessage,
} from "./libs/enums/enums.js";
import { addLeadingZeros } from "./libs/helpers/helpers.js";
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
				throw new Error(StorageErrorMessage.DELETE_OBJECTS_FAILED);
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

			for (const object of response.Contents ?? []) {
				if (object.Key) {
					keys.push(object.Key);
				}
			}

			continuationToken = response.NextContinuationToken;

			if (response.IsTruncated && !continuationToken) {
				throw new Error(
					StorageErrorMessage.LIST_OBJECTS_MISSING_CONTINUATION_TOKEN,
				);
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
  
	public async downloadToTempFolder(sourceKey: string): Promise<{
		clear: () => Promise<void>;
		filePath: string;
	}> {
		const temporaryDirectoryPath = await fs.mkdtemp(
			path.join(os.tmpdir(), TMPDIR_PREFIX),
		);
		const clear = async () => {
			await fs.rm(temporaryDirectoryPath, { force: true, recursive: true });
		};

		try {
			const temporaryFilePath = path.join(
				temporaryDirectoryPath,
				`${TMPFILE_NAME}.pdf`,
			);
			const command = new GetObjectCommand({
				Bucket: this.buckets[StorageBucket.UPLOADS],
				Key: sourceKey,
			});

			const response = await this.client.send(command);
			const nodeStream = response.Body as Readable;
			const fileWriteStream = fsSync.createWriteStream(temporaryFilePath);

			await pipeline(nodeStream, fileWriteStream);

			return {
				clear,
				filePath: temporaryFilePath,
			};
		} catch (error) {
			await clear();
			throw error;
		}
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

	public async sendPage({
		documentId,
		page,
		pageImage,
		pageThumbnail,
	}: {
		documentId: number;
		page: number;
		pageImage: Buffer;
		pageThumbnail: Buffer;
	}): Promise<{
		imageKey: string;
		thumbnailKey: string;
	}> {
		const imageKey = `pages/${documentId.toString()}/${addLeadingZeros(page)}.webp`;
		const thumbnailKey = `pages/${documentId.toString()}/${addLeadingZeros(
			page,
		)}-thumb.webp`;

		const imageCommand = new PutObjectCommand({
			Body: pageImage,
			Bucket: this.buckets[StorageBucket.PAGES],
			ContentType: ContentType.WEBP,
			Key: imageKey,
		});
		const thumbnailCommand = new PutObjectCommand({
			Body: pageThumbnail,
			Bucket: this.buckets[StorageBucket.PAGES],
			ContentType: ContentType.WEBP,
			Key: thumbnailKey,
		});

		await Promise.all([
			this.client.send(imageCommand),
			this.client.send(thumbnailCommand),
		]);

		return {
			imageKey,
			thumbnailKey,
		};
	}
}

export { BaseStorage };
