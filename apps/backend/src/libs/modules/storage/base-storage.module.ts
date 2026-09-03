import {
	GetObjectCommand,
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
	SignedUrlConfig,
	TMPDIR_PREFIX,
	TMPFILE_NAME,
} from "./libs/constants/constants.js";
import { addLeadingZeros } from "./libs/helpers/helpers.js";
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
				Bucket: this.bucketUploads,
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
			Bucket: this.bucketPages,
			Key: imageKey,
		});
		const thumbnailCommand = new PutObjectCommand({
			Body: pageThumbnail,
			Bucket: this.bucketPages,
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
