import React from "react";

type Properties = {
	className?: string | undefined;
};

const EyeIcon: React.FC<Properties> = ({ className }: Properties) => (
	<svg
		className={className}
		fill="none"
		height="20"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width="20"
	>
		<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

export { EyeIcon };
