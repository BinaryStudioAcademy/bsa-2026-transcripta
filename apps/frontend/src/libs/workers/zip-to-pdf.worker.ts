/// <reference lib="webworker" />

import {
	type Entry,
	Uint8ArrayReader,
	Uint8ArrayWriter,
	ZipReader,
} from "@zip.js/zip.js";
import { PDFDocument, type PDFImage } from "pdf-lib";

import {
	EMPTY_REMAINDER,
	PAGE_EMBED_BATCH,
	PNG_EXTENSION,
	YIELD_DELAY_MS,
} from "~/libs/constants/zip-to-pdf.constants.js";
import {
	validateZipContent,
	type ZipValidationResult,
} from "~/libs/helpers/validate-zip-content.helper.js";

type InitMessage = {
	arrayBuffer: ArrayBuffer;
	maxPages: number;
	maxUncompressedBytes: number;
	type: "init";
};

const sleep = (): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(resolve, YIELD_DELAY_MS);
	});
};

const isPng = (fileName: string): boolean => {
	return fileName.toLowerCase().endsWith(PNG_EXTENSION);
};

const embedImage = async (
	document: PDFDocument,
	bytes: Uint8Array,
	fileName: string,
): Promise<PDFImage> => {
	if (isPng(fileName)) {
		return await document.embedPng(bytes);
	}

	return await document.embedJpg(bytes);
};

globalThis.addEventListener(
	"message",
	(event: MessageEvent<InitMessage>): void => {
		void (async (): Promise<void> => {
			const { arrayBuffer, maxPages, maxUncompressedBytes } = event.data;
			const zipReader = new ZipReader(
				new Uint8ArrayReader(new Uint8Array(arrayBuffer)),
			);

			try {
				const entries = await zipReader.getEntries();
				const entriesByName = new Map<string, Entry>();
				let uncompressedBytes = 0;

				for (const entry of entries) {
					entriesByName.set(entry.filename, entry);
					uncompressedBytes += entry.uncompressedSize;
				}

				if (uncompressedBytes > maxUncompressedBytes) {
					self.postMessage({
						message: "The archive exceeds the uncompressed size limit.",
						rejectReason: "too_large",
						type: "validation",
					});

					return;
				}

				const entryNames = entries.map((entry) => entry.filename);
				const validation: ZipValidationResult = validateZipContent(
					entryNames,
					maxPages,
				);

				if (validation.status !== "valid") {
					self.postMessage({
						message: validation.message,
						rejectReason: validation.status,
						type: "validation",
					});

					return;
				}

				const pdfDocument = await PDFDocument.create();
				let processedPages = 0;

				for (const imageName of validation.sortedImages) {
					const entry = entriesByName.get(imageName);

					if (!entry?.getData) {
						continue;
					}

					let imageBytes: Uint8Array;

					try {
						imageBytes = await entry.getData(new Uint8ArrayWriter());
					} catch {
						self.postMessage({
							message: `The image "${imageName}" could not be read from the archive.`,
							type: "error",
						});

						return;
					}

					let image: PDFImage;

					try {
						image = await embedImage(pdfDocument, imageBytes, imageName);
					} catch {
						self.postMessage({
							message: `The image "${imageName}" could not be embedded into the PDF.`,
							type: "error",
						});

						return;
					}

					processedPages++;

					if (processedPages % PAGE_EMBED_BATCH === EMPTY_REMAINDER) {
						await sleep();
					}

					const page = pdfDocument.addPage([image.width, image.height]);
					page.drawImage(image, {
						height: image.height,
						width: image.width,
						x: 0,
						y: 0,
					});

					self.postMessage({
						payload: {
							processedPages,
							totalPages: validation.sortedImages.length,
						},
						type: "progress",
					});
				}

				let pdfBytes: Uint8Array;

				try {
					pdfBytes = await pdfDocument.save();
				} catch {
					self.postMessage({
						message: "The PDF document could not be generated.",
						type: "error",
					});

					return;
				}

				self.postMessage({
					payload: {
						pdfBytes,
						totalPages: validation.sortedImages.length,
					},
					type: "done",
				});
			} catch {
				self.postMessage({
					message: "The file is not a valid ZIP archive.",
					type: "error",
				});
			} finally {
				await zipReader.close();
			}
		})();
	},
);
