import { NavLink } from "react-router-dom";

type Properties = {
	children: React.ReactNode;
	className?: string;
	to: string;
};

const Link: React.FC<Properties> = ({
	children,
	className = "",
	to,
}: Properties) => (
	<NavLink className={className} to={to}>
		{children}
	</NavLink>
);

export { Link };
