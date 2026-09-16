import { type ModelIdValue } from "~/libs/types/types.js";
import { type BuiltContext } from "~/modules/context/libs/types/types.js";
import { type PageModel } from "~/modules/pages/page.model.js";
import { type PresetModel } from "~/modules/presets/preset.model.js";

import { type Dependencies } from "./dependencies.type.js";

type ResolveOptions = Pick<
	Dependencies,
	"config" | "logger" | "storage" | "transcriptionService"
> & {
	cacheKey: string;
	context: BuiltContext;
	documentId: number;
	modelId: ModelIdValue;
	page: InstanceType<typeof PageModel>;
	pageNo: number;
	preset: InstanceType<typeof PresetModel>;
};

export { type ResolveOptions };
