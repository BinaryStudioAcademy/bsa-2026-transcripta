import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp, { type Sharp } from "sharp";

import { BLANK_STDEV_THRESHOLD } from "./libs/constants/constants.js";
import { type PDFPageProcessor as IPDFPageProcessor } from "./libs/types/types.js";

const execAsync = promisify(execFile);

class PDFPageProcessor implements IPDFPageProcessor {
	private async convertPageToPNG(
		filePath: string,
		page: number,
	): Promise<string> {
		const directoryName = path.dirname(filePath);
		const stringPage = String(page);
		const pngPath = `${directoryName}/page-${stringPage}`;

		await execAsync(
			"pdftoppm",
			[
				"-f",
				stringPage,
				"-l",
				stringPage,
				"-r",
				"300",
				"-png",
				"-singlefile",
				filePath,
				pngPath,
			],
			{
				timeout: 60_000,
			},
		);

		return `${pngPath}.png`;
	}

	private async createNormilized(source: Sharp): Promise<Buffer> {
		const normalized = await source
			.clone()
			.resize({ width: 2048, withoutEnlargement: true })
			.webp({ quality: 85 })
			.toBuffer();

		return normalized;
	}

	private async createThumbnail(source: Sharp): Promise<Buffer> {
		const thumbnail = await source
			.clone()
			.resize({ width: 512, withoutEnlargement: true })
			.webp({ quality: 85 })
			.toBuffer();

		return thumbnail;
	}

	private async isBlankPage(
		image: Buffer,
		stdevThreshold: number,
	): Promise<boolean> {
		const { channels } = await sharp(image).stats();
		const [grey] = channels;

		return grey !== undefined && grey.stdev <= stdevThreshold;
	}

	private sharpImage(path: string): Sharp {
		const source = sharp(path).grayscale();

		return source;
	}

	public async getPageCount(filePath: string): Promise<number> {
		const { stdout } = await execAsync("pdfinfo", [filePath]);

		const match = new RegExp(/^Pages:\s+(?<count>\d+)$/im).exec(stdout);
		const pageCount = match?.groups?.["count"];

		if (!pageCount) {
			throw new Error("Failed to get page count");
		}

		return Number(pageCount);
	}

	public async processPage(
		filePath: string,
		page: number,
		blankStdevThreshold: null | number,
	): Promise<{
		isBlank: boolean;
		pageImage: Buffer;
		pageThumbnail: Buffer;
	}> {
		const pngPath = await this.convertPageToPNG(filePath, page);

		try {
			const source = this.sharpImage(pngPath);
			const pageImage = await this.createNormilized(source);
			const pageThumbnail = await this.createThumbnail(source);
			const isBlank = await this.isBlankPage(
				pageImage,
				blankStdevThreshold ?? BLANK_STDEV_THRESHOLD,
			);

			return {
				isBlank,
				pageImage,
				pageThumbnail,
			};
		} finally {
			await fs.rm(pngPath, { force: true });
		}
	}
}

export { PDFPageProcessor };
