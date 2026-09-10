import { type BuiltContext } from "~/modules/context/libs/types/types.js";
import { type PageModel } from "~/modules/pages/page.model.js";
import { type PresetModel } from "~/modules/presets/preset.model.js";

import { type Dependencies } from "./dependencies.type.js";

type ResolveOptions = Dependencies & {
	cacheKey: string;
	context: BuiltContext;
	documentId: number;
	modelId: string;
	page: InstanceType<typeof PageModel>;
	pageNo: number;
	preset: InstanceType<typeof PresetModel>;
};

export { type ResolveOptions };
