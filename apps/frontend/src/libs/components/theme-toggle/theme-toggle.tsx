import { useTheme } from "../../hooks/hooks.js";

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button aria-label="Toggle theme" onClick={toggleTheme} type="button">
			{theme === "dark" ? "☀️ Light" : "🌙 Dark"}
		</button>
	);
};

export { ThemeToggle };
