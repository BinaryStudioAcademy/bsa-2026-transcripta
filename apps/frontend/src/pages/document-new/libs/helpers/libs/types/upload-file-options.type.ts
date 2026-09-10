type UploadFileOptions = {
	file: File;
	onProgress: (percent: number) => void;
	signal?: AbortSignal;
	uploadUrl: string;
};

export { type UploadFileOptions };
