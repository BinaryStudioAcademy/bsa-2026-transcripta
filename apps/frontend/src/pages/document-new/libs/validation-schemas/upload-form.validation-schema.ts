import { DocumentCreateValidationSchema } from "~/modules/documents/documents.js";

const uploadFormValidationSchema = DocumentCreateValidationSchema.pick({
	presetId: true,
	title: true,
});

export { uploadFormValidationSchema };
