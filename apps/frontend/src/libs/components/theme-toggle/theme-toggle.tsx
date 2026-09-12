import { Button } from "~/libs/components/components.js";
import { Theme } from "~/libs/enums/enums.js";
import { useTheme } from "~/libs/hooks/hooks.js";

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			label={theme === Theme.DARK ? "Day" : "Night"}
			onClick={toggleTheme}
			type="button"
		/>
	);
};

export { ThemeToggle };
