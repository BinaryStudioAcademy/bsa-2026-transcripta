import { NavLink, type NavLinkProps } from "react-router-dom";

type Properties = Omit<NavLinkProps, "children" | "className" | "to"> & {
	children: React.ReactNode;
	className?: string | undefined;
	to: string;
};

const Link: React.FC<Properties> = ({ children, className, to, ...rest }) => (
	<NavLink className={className ?? ""} to={to} {...rest}>
		{children}
	</NavLink>
);

export { Link };
