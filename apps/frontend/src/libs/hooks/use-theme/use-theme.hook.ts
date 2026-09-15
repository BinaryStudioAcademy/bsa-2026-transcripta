import { useCallback, useEffect, useState } from "react";

import { Theme } from "~/libs/enums/enums.js";
import { StorageKey } from "~/libs/modules/storage/libs/enums/enums.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { type ValueOf } from "~/libs/types/types.js";

import { COLOR_SCHEME_QUERY } from "./libs/constants/constants.js";

type ThemeValue = ValueOf<typeof Theme>;

const useTheme = (): { theme: ThemeValue; toggleTheme: () => void } => {
	const [theme, setTheme] = useState<ThemeValue>(() => {
		const appliedTheme = document.documentElement.dataset["theme"];

		if (appliedTheme === Theme.DARK || appliedTheme === Theme.LIGHT) {
			return appliedTheme;
		}

		const prefersDark = globalThis.matchMedia(COLOR_SCHEME_QUERY).matches;

		return prefersDark ? Theme.DARK : Theme.LIGHT;
	});

	useEffect(() => {
		document.documentElement.dataset["theme"] = theme;
		void storage.set(StorageKey.THEME, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((previousTheme) =>
			previousTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
		);
	}, []);

	return { theme, toggleTheme };
};

export { useTheme };
