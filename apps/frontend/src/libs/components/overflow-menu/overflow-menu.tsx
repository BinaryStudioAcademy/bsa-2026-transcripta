import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./overflow-menu.module.css";

type MenuItem = {
	isDanger?: boolean;
	label: string;
	onClick: () => void;
};

type Properties = {
	items: MenuItem[];
};

const OverflowMenu: React.FC<Properties> = ({ items }: Properties) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerReference = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleClickOutside = (event: MouseEvent): void => {
			if (
				containerReference.current &&
				!containerReference.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleTriggerClick = useCallback((): void => {
		setIsOpen((previous) => !previous);
	}, []);

	const handleItemClick = useCallback(
		(onClick: () => void) => (): void => {
			onClick();
			setIsOpen(false);
		},
		[],
	);

	return (
		<div className={styles["container"]} ref={containerReference}>
			<button
				aria-label="More actions"
				className={styles["trigger"]}
				onClick={handleTriggerClick}
				type="button"
			>
				⋯
			</button>

			{isOpen && (
				<div className={styles["menu"]} role="menu">
					{items.map((item) => (
						<button
							className={[
								styles["item"],
								item.isDanger && styles["item--danger"],
							]
								.filter(Boolean)
								.join(" ")}
							key={item.label}
							onClick={handleItemClick(item.onClick)}
							role="menuitem"
							type="button"
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export { OverflowMenu };
