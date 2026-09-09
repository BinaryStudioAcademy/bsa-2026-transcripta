/// <reference lib="webworker" />

import JSZip from "jszip";
import { PDFDocument, type PDFImage } from "pdf-lib";

import {
	EMPTY_REMAINDER,
	PAGE_EMBED_BATCH,
	PNG_EXTENSION,
	YIELD_DELAY_MS,
} from "~/libs/constants/zip-to-pdf.constants.js";
import { isImageFile } from "~/libs/helpers/is-image-file.helper.js";
import {
	validateZipContent,
	type ZipValidationResult,
} from "~/libs/helpers/validate-zip-content.helper.js";

type InitMessage = {
	arrayBuffer: ArrayBuffer;
	maxPages: number;
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

// eslint-disable-next-line sonarjs/post-message
globalThis.addEventListener(
	"message",
	(event: MessageEvent<InitMessage>): void => {
		void (async (): Promise<void> => {
			const { arrayBuffer, maxPages } = event.data;

			let zip: JSZip;

			try {
				// eslint-disable-next-line sonarjs/no-unsafe-unzip
				zip = await JSZip.loadAsync(arrayBuffer);
			} catch {
				self.postMessage({
					message: "The file is not a valid ZIP archive.",
					type: "error",
				});

				return;
			}

			const entries = Object.keys(zip.files);
			const validation: ZipValidationResult = validateZipContent(
				entries,
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

			const sortedImages = validation.sortedImages;
			let processedPages = 0;

			for (const imageName of sortedImages) {
				if (!isImageFile(imageName)) {
					continue;
				}

				const file = zip.file(imageName);

				if (!file) {
					continue;
				}

				let imageBytes: Uint8Array;

				try {
					imageBytes = await file.async("uint8array");
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
						totalPages: sortedImages.length,
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
					totalPages: sortedImages.length,
				},
				type: "done",
			});
		})();
	},
);
