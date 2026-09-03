import { HTTPCode } from "@transcripta/shared";

import { PERCENT_MULTIPLIER } from "./constants.js";
import { UploadFileOptions } from "./types.js";

const uploadFile = ({
	file,
	onProgress,
	uploadUrl,
}: UploadFileOptions): Promise<void> => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open("PUT", uploadUrl);

		xhr.upload.addEventListener("progress", (event) => {
			if (event.lengthComputable) {
				onProgress(
					Math.round((event.loaded / event.total) * PERCENT_MULTIPLIER),
				);
			}
		});

		xhr.addEventListener("load", () => {
			if (xhr.status === HTTPCode.OK) {
				resolve();
			} else {
				reject(new Error(`Upload failed with status ${String(xhr.status)}`));
			}
		});

		xhr.addEventListener("error", () => {
			reject(new Error("Upload failed"));
		});

		xhr.send(file);
	});
};

export { uploadFile };
