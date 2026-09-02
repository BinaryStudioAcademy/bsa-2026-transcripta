import { NavLink, type NavLinkProps } from "react-router-dom";

type Properties = Omit<NavLinkProps, "children" | "to"> & {
	children: React.ReactNode;
	to: string;
};

const Link: React.FC<Properties> = ({ children, to, ...rest }) => (
	<NavLink to={to} {...rest}>
		{children}
	</NavLink>
);

export { Link };
