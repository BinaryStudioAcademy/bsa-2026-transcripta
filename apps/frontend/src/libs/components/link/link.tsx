import { NavLink } from "react-router-dom";

type Properties = {
	children: React.ReactNode;
	to: string;
};

const Link: React.FC<Properties> = ({ children, to }: Properties) => (
	<NavLink to={to}>{children}</NavLink>
);

export { Link };
