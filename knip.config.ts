import { type KnipConfig } from "knip";

const config: KnipConfig = {
	prettier: ["./prettier.config.js"],
	stylelint: ["./stylelint.config.ts"],
	workspaces: {
		".": {
			entry: ["./dangerfile.ts"],
			ignore: ["design/**"],
		},
		"apps/backend": {
			entry: [
				"src/db/migrations/*.ts",
				"knexfile.ts",
				"src/modules/pages/page.model.ts",
				"src/modules/pages/page.repository.ts",
			],
			ignoreDependencies: [],
		},
		"apps/frontend": {
			// Waiting to be wired up by [FE] Upload a document #73:
			ignore: [
				"src/libs/enums/zip-processing-status.enum.ts",
				"src/libs/helpers/is-image-file.helper.ts",
				"src/libs/helpers/natural-sort.helper.ts",
				"src/libs/helpers/validate-zip-content.helper.ts",
				"src/libs/hooks/use-zip-processor/**",
				"src/libs/workers/**",
			],
			ignoreDependencies: [],
		},
		"packages/shared": {
			includeEntryExports: true,
		},
	},
};

export default config;
