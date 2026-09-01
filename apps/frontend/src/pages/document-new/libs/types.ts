type FileValidationResult =
	| { isValid: false; reason: string }
	| { isValid: true };

type ScreenState = "rejected" | "rest" | "selected" | "success";

type UploadFormValues = {
	presetId: number;
	title: string;
};

export { type FileValidationResult, type ScreenState, type UploadFormValues };
