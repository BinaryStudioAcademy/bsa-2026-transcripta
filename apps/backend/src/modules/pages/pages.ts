import { PageModel } from "./page.model.js";
import { PageRepository } from "./page.repository.js";

const pageRepository = new PageRepository(PageModel);

export { pageRepository };
