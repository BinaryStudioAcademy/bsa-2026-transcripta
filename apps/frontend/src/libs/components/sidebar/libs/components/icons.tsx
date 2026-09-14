const DocumentIcon: React.FC = () => (
	<span className="sidebar__icon">
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
		>
			<path d="M6 2 h8 l4 4 v14 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 z" />
			<path d="M14 2 v4 h4" />
			<path d="M8 12 h8 M8 16 h8" />
		</svg>
	</span>
);

const PresetsIcon: React.FC = () => (
	<span className="sidebar__icon">
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
		>
			<path d="M12 4 L17 7 L12 10 L7 7 z" />
			<path d="M12 14 L17 17 L12 20 L7 17 z" />
		</svg>
	</span>
);

const ChevronLeftIcon: React.FC = () => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M15 18 l-6 -6 6 -6" />
	</svg>
);

const ChevronRightIcon: React.FC = () => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M9 18 l6 -6 -6 -6" />
	</svg>
);

const LogOutIcon: React.FC = () => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M9 21 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 h4" />
		<path d="M16 17 l5 -5 -5 -5 M21 12 H9" />
	</svg>
);

export {
	ChevronLeftIcon,
	ChevronRightIcon,
	DocumentIcon,
	LogOutIcon,
	PresetsIcon,
};
