import { PDFPageProcessor } from "./pdf-page-processor.module.js";

const pdfPageProcessor = new PDFPageProcessor();

export { pdfPageProcessor };
export { ErrorMessage as PDFPageProcessorErrorMessage } from "./libs/enums/enums.js";
export { type PDFPageProcessor } from "./pdf-page-processor.module.js";
