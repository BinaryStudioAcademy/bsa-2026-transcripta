type UploadFileOptions = {
	file: File;
	onProgress: (percent: number) => void;
	uploadUrl: string;
};

export { type UploadFileOptions };
