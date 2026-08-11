import {
	type Rule,
	RuleConfigSeverity,
	type UserConfig,
} from "@commitlint/types";

import { ProjectPrefix } from "./project.config.js";

const COMMIT_MODIFIERS = ["+", "*", "-"] as const;

const escapedCommitModifiers = COMMIT_MODIFIERS.map(
	(modifier) => `\\${modifier}`,
).join("|");
const COMMIT_MESSAGE_REGEXP = new RegExp(
	`^(${ProjectPrefix.APP}-[0-9]{1,6}): (${escapedCommitModifiers}) (.*\\S)$`,
);

const COMMIT_MESSAGE_MATCH_RULE_MESSAGE = `commit message doesn't match format requirements
Commit message must have the following format:
	- <project-prefix>-<issue-number>: <modifier> <description>
Where:
	- <project-prefix>: ${ProjectPrefix.APP}
	- <modifier>: ${COMMIT_MODIFIERS.join(", ")}
Examples:
	- ${ProjectPrefix.APP}-6: + header component
	- ${ProjectPrefix.APP}-12: * header styles
	- ${ProjectPrefix.APP}-16: - header component`;

const commitMessageMatch: Rule = (parsed) => {
	const isValid = COMMIT_MESSAGE_REGEXP.test(parsed.header ?? "");

	return isValid ? [true] : [false, COMMIT_MESSAGE_MATCH_RULE_MESSAGE];
};

const config: UserConfig = {
	defaultIgnores: true,
	parserPreset: {
		parserOpts: {
			headerCorrespondence: ["prefix", "modifier", "description"],
			headerPattern: COMMIT_MESSAGE_REGEXP,
		},
	},
	plugins: [
		{
			rules: {
				"commit-message-match": commitMessageMatch,
			},
		},
	],
	rules: {
		"commit-message-match": [RuleConfigSeverity.Error, "always"],
	},
};

export default config;
