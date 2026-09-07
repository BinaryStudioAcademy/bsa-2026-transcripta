import { DocumentCreateValidationSchema } from "~/modules/documents/documents.js";

const fileValidationSchema = DocumentCreateValidationSchema.pick({
	fileBytes: true,
	fileName: true,
});

export { fileValidationSchema };
