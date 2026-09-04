import { HTTPCode } from "~/libs/enums/enums.js";

import { PERCENT_MULTIPLIER } from "./libs/constants/constants.js";
import { type UploadFileOptions } from "./libs/types/types.js";

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
