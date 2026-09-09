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
			ignore: ["src/libs/workers/**"],
			ignoreDependencies: [],
		},
		"packages/shared": {
			includeEntryExports: true,
		},
	},
};

export default config;
