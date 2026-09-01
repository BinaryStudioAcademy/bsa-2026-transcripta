const DEFAULT_PRESET_INDEX = 0;
const FIRST_FILE_INDEX = 0;
const BYTES_IN_KILOBYTE = 1024;
const KILOBYTES_IN_MEGABYTE = 1024;
const MAX_FILE_SIZE_MEGABYTES = 500;

const MAX_FILE_BYTES =
	MAX_FILE_SIZE_MEGABYTES * KILOBYTES_IN_MEGABYTE * BYTES_IN_KILOBYTE;

const MOCK_PRESET_OPTIONS = [
	{ id: 1, name: "Parish register" },
	{ id: 2, name: "Medical record" },
	{ id: 3, name: "Diary" },
];
const PDF_FILE_REGEX = /^.+\.pdf$/i;

const DocumentValidationMessage = {
	DOCUMENT_MAX_FILE_BYTES:
		"The file exceeds the maximum allowed size (500 MB).",
	FILE_NAME_INVALID_NAME:
		"The file name must contain at least one character before the pdf extension. Only PDF files are allowed.",
	FILE_NAME_REQUIRE: "File name is required.",
	PRESET_ID_REQUIRE: "Preset ID is required.",
	PRESET_NOT_FOUND: "Preset not found.",
	TITLE_REQUIRE: "Title is required.",
	USER_NOT_FOUND: "User not found.",
} as const;

export {
	DEFAULT_PRESET_INDEX,
	DocumentValidationMessage,
	FIRST_FILE_INDEX,
	MAX_FILE_BYTES,
	MOCK_PRESET_OPTIONS,
	PDF_FILE_REGEX,
};
