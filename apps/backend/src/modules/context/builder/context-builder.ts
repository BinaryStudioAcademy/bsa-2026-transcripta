import { pageRepository } from "~/modules/pages/pages.js";

import { ContextBuilder } from "./context-builder.module.js";

const contextBuilder = new ContextBuilder(pageRepository);

const buildContext = contextBuilder.buildContext.bind(contextBuilder);

export { buildContext };
