import { logger } from "~/libs/modules/logger/logger.js";
import { PageModel } from "~/modules/pages/page.model.js";
import { PageRepository } from "~/modules/pages/page.repository.js";

import { ContextBuilder } from "./context-builder.module.js";

const pageRepository = new PageRepository(PageModel);
const contextBuilder = new ContextBuilder(logger, pageRepository);

const buildContext = contextBuilder.buildContext.bind(contextBuilder);

export { buildContext };
