import { useCallback, useEffect, useState } from "react";

import { Theme } from "~/libs/enums/enums.js";
import { StorageKey } from "~/libs/modules/storage/libs/enums/enums.js";
import { storage } from "~/libs/modules/storage/storage.js";
import { type ValueOf } from "~/libs/types/types.js";

import { COLOR_SCHEME_QUERY } from "./libs/constants/constants.js";

type ThemeValue = ValueOf<typeof Theme>;

const useTheme = (): { theme: ThemeValue; toggleTheme: () => void } => {
	const [theme, setTheme] = useState<ThemeValue>(() => {
		const prefersDark = globalThis.matchMedia(COLOR_SCHEME_QUERY).matches;

		return prefersDark ? Theme.DARK : Theme.LIGHT;
	});
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	useEffect(() => {
		const loadStoredTheme = async (): Promise<void> => {
			const storedTheme = await storage.get<ThemeValue>(StorageKey.THEME);

			if (storedTheme) {
				setTheme(storedTheme);
			}

			setIsLoaded(true);
		};

		void loadStoredTheme();
	}, []);

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		document.documentElement.dataset["theme"] = theme;
		void storage.set(StorageKey.THEME, theme);
	}, [theme, isLoaded]);

	const toggleTheme = useCallback(() => {
		setTheme((previousTheme) =>
			previousTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
		);
	}, []);

	return { theme, toggleTheme };
};

export { useTheme };
