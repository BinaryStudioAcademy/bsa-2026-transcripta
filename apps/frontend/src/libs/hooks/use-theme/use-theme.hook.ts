import { useCallback, useEffect, useState } from "react";

import { StorageKey } from "../../modules/storage/libs/enums/storage-key.enum.js";
import { storage } from "../../modules/storage/storage.js";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const useTheme = (): { theme: string; toggleTheme: () => void } => {
	const [theme, setTheme] = useState<string>(() => {
		const storedTheme = localStorage.getItem(StorageKey.THEME);

		if (storedTheme) {
			return storedTheme;
		}

		const prefersDark = globalThis.matchMedia(COLOR_SCHEME_QUERY).matches;

		return prefersDark ? "dark" : "light";
	});

	useEffect(() => {
		document.documentElement.dataset["theme"]= theme;
		void storage.set(StorageKey.THEME, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((previousTheme) => (previousTheme === "dark" ? "light" : "dark"));
	}, []);

	return { theme, toggleTheme };
};

export { useTheme };