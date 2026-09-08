import { Theme } from "~/libs/enums/enums.js";
import { useTheme } from "~/libs/hooks/hooks.js";

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button aria-label="Toggle theme" onClick={toggleTheme} type="button">
			{theme === Theme.DARK ? "☀️ Light" : "🌙 Dark"}
		</button>
	);
};

export { ThemeToggle };
