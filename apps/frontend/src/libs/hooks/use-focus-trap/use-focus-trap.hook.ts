import { useEffect, useRef } from "react";

import {
	EMPTY_LENGTH,
	FIRST_INDEX,
} from "~/libs/constants/common.constants.js";
import {
	FOCUSABLE_SELECTOR,
	LAST_ITEM_INDEX,
} from "~/libs/constants/constants.js";

const getFocusable = (container: HTMLElement): HTMLElement[] =>
	[...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
		(element) => element.getClientRects().length > EMPTY_LENGTH,
	);

const useFocusTrap = <T extends HTMLElement>(): React.RefObject<null | T> => {
	const containerReference = useRef<null | T>(null);

	useEffect(() => {
		const container = containerReference.current;

		if (!container) {
			return;
		}

		const opener =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;

		getFocusable(container)[FIRST_INDEX]?.focus();

		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== "Tab") {
				return;
			}

			const focusable = getFocusable(container);
			const first = focusable[FIRST_INDEX];
			const last = focusable.at(LAST_ITEM_INDEX);

			if (!first || !last) {
				event.preventDefault();

				return;
			}

			const active = document.activeElement;
			const isInside = active instanceof Node && container.contains(active);

			if (event.shiftKey && (active === first || !isInside)) {
				event.preventDefault();
				last.focus();

				return;
			}

			if (!event.shiftKey && (active === last || !isInside)) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return (): void => {
			document.removeEventListener("keydown", handleKeyDown);

			if (opener?.isConnected) {
				opener.focus();
			}
		};
	}, []);

	return containerReference;
};

export { useFocusTrap };
