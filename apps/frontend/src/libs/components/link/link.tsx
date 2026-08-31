import { NavLink, type NavLinkProps } from "react-router-dom";

import { type AppRoute } from "~/libs/enums/enums.js";
import { type ValueOf } from "~/libs/types/types.js";

/* eslint-disable react/prop-types */
type Properties = Omit<NavLinkProps, "to"> & {
	to: ValueOf<typeof AppRoute>;
};

const Link: React.FC<Properties> = ({ children, to, ...rest }) => (
	<NavLink to={to} {...rest}>
		{children}
	</NavLink>
);

export { Link };
