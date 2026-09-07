import { PageModel } from "./page.model.js";
import { PageRepository } from "./page.repository.js";

const pageRepository = new PageRepository(PageModel);

export { PageEntity } from "./page.entity.js";
export { PageRepository } from "./page.repository.js";
export { pageRepository };
