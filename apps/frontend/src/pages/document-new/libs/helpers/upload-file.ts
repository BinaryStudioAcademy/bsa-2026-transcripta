import { HTTPCode, HTTPMethod } from "~/libs/enums/enums.js";
import { notification } from "~/libs/modules/notification/notification.js";

import { PERCENT_MULTIPLIER } from "./libs/constants/constants.js";
import { XHREvent } from "./libs/enums/enums.js";
import { type UploadFileOptions } from "./libs/types/types.js";

const uploadFile = ({
	file,
	onProgress,
	uploadUrl,
}: UploadFileOptions): Promise<void> => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open(HTTPMethod.PUT, uploadUrl);

		xhr.upload.addEventListener(XHREvent.PROGRESS, (event) => {
			if (event.lengthComputable) {
				onProgress(
					Math.round((event.loaded / event.total) * PERCENT_MULTIPLIER),
				);
			}
		});

		xhr.addEventListener(XHREvent.LOAD, () => {
			if (xhr.status === HTTPCode.OK) {
				resolve();
			} else {
				const message = `Upload failed with status ${String(xhr.status)}`;
				notification.error(message);
				reject(new Error(message));
			}
		});

		xhr.addEventListener(XHREvent.ERROR, () => {
			const message = "Upload Failed";
			notification.error(message);
			reject(new Error(message));
		});

		xhr.send(file);
	});
};

export { uploadFile };
