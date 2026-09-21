import { LogoIcon } from "../logo-icon/logo-icon.js";
import { LOGO_SIZE, WORDMARK } from "./libs/constants/constants.js";
import styles from "./styles.module.css";

type Properties = {
	size?: (typeof LOGO_SIZE)[keyof typeof LOGO_SIZE];
	withWordmark?: boolean;
};

const Logo: React.FC<Properties> = ({
	size = LOGO_SIZE.MEDIUM,
	withWordmark = true,
}: Properties) => {
	const className = [styles["logo"], styles[size]].join(" ");

	return (
		<span className={className}>
			<LogoIcon size={size} />
			{withWordmark && <span className={styles["wordmark"]}>{WORDMARK}</span>}
		</span>
	);
};

export { Logo };
