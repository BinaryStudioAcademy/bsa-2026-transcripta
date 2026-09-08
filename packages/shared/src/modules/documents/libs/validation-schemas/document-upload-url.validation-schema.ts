import { DocumentCreateValidationSchema } from "./document-create.validation-schema.js";

const DocumentUploadUrlValidationSchema =
	DocumentCreateValidationSchema.partial();

export { DocumentUploadUrlValidationSchema };
