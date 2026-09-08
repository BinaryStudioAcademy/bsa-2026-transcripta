import { HTTPCode, HTTPMethod } from "~/libs/enums/enums.js";

import { PERCENT_MULTIPLIER } from "./libs/constants/constants.js";
import { UploadErrorMessage, XHREvent } from "./libs/enums/enums.js";
import { type UploadFileOptions } from "./libs/types/types.js";

class UploadError extends Error {
	public status: number;
	public constructor(message: string, status: number) {
		super(message);
		this.status = status;
		this.name = UploadErrorMessage.UPLOAD_NAME;
	}
}

const uploadFile = ({
	file,
	onProgress,
	signal,
	uploadUrl,
}: UploadFileOptions): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new Error(UploadErrorMessage.UPLOAD_CANCELLED));
			return;
		}

		const xhr = new XMLHttpRequest();

		if (signal) {
			signal.addEventListener(XHREvent.ABORT, () => {
				xhr.abort();
				reject(new Error(UploadErrorMessage.UPLOAD_CANCELLED));
			});
		}

		xhr.open(HTTPMethod.PUT, uploadUrl);

		xhr.upload.addEventListener(XHREvent.PROGRESS, (event) => {
			if (event.lengthComputable) {
				onProgress(
					Math.round((event.loaded / event.total) * PERCENT_MULTIPLIER),
				);
			}
		});

		xhr.addEventListener(XHREvent.LOAD, () => {
			if (xhr.status === HTTPCode.OK || xhr.status === HTTPCode.NO_CONTENT) {
				resolve();
			} else {
				const message = UploadErrorMessage.FAILED_WITH_STATUS(xhr.status);
				reject(new UploadError(message, xhr.status));
			}
		});

		xhr.addEventListener(XHREvent.ERROR, () => {
			if (signal?.aborted) {
				reject(new Error(UploadErrorMessage.UPLOAD_CANCELLED));
				return;
			}
			const message = UploadErrorMessage.NETWORK_OR_ABORTED;
			reject(new Error(message));
		});

		xhr.send(file);
	});
};

export { UploadError, uploadFile };
