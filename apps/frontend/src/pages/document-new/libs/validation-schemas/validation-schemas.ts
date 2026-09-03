import { DocumentCreateValidationSchema } from "~/modules/documents/documents.js";

const fileValidationSchema = DocumentCreateValidationSchema.pick({
	fileBytes: true,
	fileName: true,
});

const uploadFormValidationSchema = DocumentCreateValidationSchema.pick({
	presetId: true,
	title: true,
});

export { fileValidationSchema, uploadFormValidationSchema };
