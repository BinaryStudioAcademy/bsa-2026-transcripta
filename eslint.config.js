import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { resolve as tsResolver } from "eslint-import-resolver-typescript";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

const JS_MAX_PARAMS_ALLOWED = 3;

/** @typedef {import("eslint").Linter.Config} */
let Config;
/** @typedef {import("eslint").Linter.ParserModule} */
let ParserModule;

/** @type {Config} */
const filesConfig = {
	files: ["**/*.{js,ts,tsx}"],
};

/** @type {Config} */
const ignoresConfig = {
	// Workspaces lint themselves; docs holds standalone scripts (the demo
	// renderer), not application code; design holds exported Claude Design
	// artifacts (generated runtime, not source).
	ignores: ["apps", "packages", "docs", "design", "dangerfile.ts"],
};

/** @type {Config} */
const jsConfig = {
	languageOptions: {
		globals: globals.node,
		parserOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
		},
	},
	rules: {
		...js.configs.recommended.rules,
		"arrow-parens": ["error", "always"],
		curly: ["error", "all"],
		"max-params": ["error", JS_MAX_PARAMS_ALLOWED],
		"no-console": ["error"],
		"no-multiple-empty-lines": [
			"error",
			{
				max: 1,
			},
		],
		"no-restricted-syntax": [
			"error",
			{
				message: "Export/Import all (*) is forbidden.",
				selector: "ExportAllDeclaration,ImportAllDeclaration",
			},
			{
				message: "Exports should be at the end of the file.",
				selector: "ExportNamedDeclaration[declaration!=null]",
			},
			{
				message: "TS features are forbidden",
				selector: "TSEnumDeclaration,ClassDeclaration[abstract=true]",
			},
		],
		quotes: ["error", "double"],
	},
};

/** @type {Config} */
const importConfig = {
	plugins: {
		import: importPlugin,
	},
	rules: {
		...importPlugin.configs.recommended.rules,
		"import/exports-last": ["error"],
		"import/extensions": [
			"error",
			{
				js: "ignorePackages",
			},
		],
		"import/newline-after-import": ["error"],
		"import/no-default-export": ["error"],
		"import/no-duplicates": ["error"],
	},
	settings: {
		"import/parsers": {
			espree: [".js", ".cjs"],
		},
		"import/resolver": {
			"node": {
				"extensions": [".js", ".ts", ".tsx"],
			},
			typescript: tsResolver,
		},
	},
};

/** @type {Config} */
const sonarConfig = {
	plugins: {
		sonarjs,
	},
	rules: {
		...sonarjs.configs.recommended.rules,
		"sonarjs/no-hardcoded-passwords": "off",
		"sonarjs/todo-tag": "off",
	},
};

/** @type {Config} */
const unicornConfig = {
	plugins: {
		unicorn,
	},
	rules: {
		...unicorn.configs.recommended.rules,
		"unicorn/no-null": ["off"],
	},
};

/** @type {Config} */
const perfectionistConfig = {
	plugins: {
		perfectionist,
	},
	rules: {
		...perfectionist.configs["recommended-natural"].rules,
		"perfectionist/sort-classes": [
			"error",
			{
				groups: [
					"index-signature",
					// properties
					["static-property", "static-accessor-property"],
					["protected-static-property", "protected-static-accessor-property"],
					["private-static-property", "private-static-accessor-property"],
					["private-property", "private-accessor-property"],
					["public-property", "public-accessor-property"],
					["property", "accessor-property"],

					"constructor",
					// getters-setters
					["static-get-method", "static-set-method"],
					["protected-static-get-method", "protected-static-set-method"],
					["private-static-get-method", "private-static-set-method"],
					["public-static-get-method", "public-static-set-method"],
					["protected-get-method", "protected-set-method"],
					["private-get-method", "private-set-method"],
					["get-method", "set-method"],

					"static-block",

					//methods
					["static-method", "static-function-property"],
					["protected-static-method", "protected-static-function-property"],
					["private-static-method", "private-static-function-property"],
					["protected-method", "protected-function-property"],
					["private-method", "private-function-property"],
					["public-method", "public-function-property"],

					"unknown",
				],
			},
		],
		"perfectionist/sort-named-exports": [
			"error",
			{
				groupKind: "types-first",
			},
		],
	},
};

/** @type {Config} */
const typescriptConfig = {
	files: ["**/*.ts", "**/*.tsx"],
	languageOptions: {
		parser: /** @type {ParserModule} */ (tsParser),
		parserOptions: {
			project: "./tsconfig.json",
		},
	},
	plugins: {
		"@typescript-eslint": ts,
	},
	rules: {
		...ts.configs["strict-type-checked"].rules,
		"@typescript-eslint/no-magic-numbers": [
			"error",
			{
				ignoreEnums: true,
				ignoreReadonlyClassProperties: true,
			},
		],
		"@typescript-eslint/no-unnecessary-type-parameters": "off",
		"@typescript-eslint/return-await": ["error", "always"],
	},
};

/** @type {Config} */
const jsdocConfig = {
	files: ["eslint.config.js", "lint-staged.config.js"],
	plugins: {
		jsdoc,
	},
	rules: {
		...jsdoc.configs["recommended-typescript-flavor-error"].rules,
		"jsdoc/no-undefined-types": ["error"],
	},
};

/** @type {Config[]} */
const overridesConfigs = [
	{
		files: [
			"commitlint.config.ts",
			"prettier.config.js",
			"stylelint.config.ts",
			"knip.config.ts",
			"packages.d.ts",
			"lint-staged.config.js",
			"eslint.config.js",
		],
		rules: {
			"import/no-default-export": ["off"],
		},
	},
];

/** @type {Config[]} */
const config = [
	filesConfig,
	ignoresConfig,
	jsConfig,
	importConfig,
	sonarConfig,
	unicornConfig,
	perfectionistConfig,
	typescriptConfig,
	jsdocConfig,
	...overridesConfigs,
];

export default config;
