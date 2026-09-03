type FileValidationResult =
	| { isValid: false; reason: string }
	| { isValid: true };

type ScreenState = "rejected" | "rest" | "selected" | "uploading";

type UploadFileOptions = {
	file: File;
	onProgress: (percent: number) => void;
	uploadUrl: string;
};

type UploadFormValues = {
	presetId: number;
	title: string;
};

export {
	type FileValidationResult,
	type ScreenState,
	type UploadFileOptions,
	type UploadFormValues,
};
