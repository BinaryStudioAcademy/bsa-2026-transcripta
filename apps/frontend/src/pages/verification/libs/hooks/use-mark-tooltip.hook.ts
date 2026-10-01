import { useCallback, useEffect, useState } from "~/libs/hooks/hooks.js";

import { DATA_TIP_ATTRIBUTE } from "../constants/verification.constants.js";
import {
	type MarkTooltipState,
	type UseMarkTooltipReturn,
} from "../types/types.js";

const useMarkTooltip = (resetKey: string): UseMarkTooltipReturn => {
	const [markTooltip, setMarkTooltip] = useState<MarkTooltipState | null>(null);

	const showMarkTooltip = useCallback(
		(event: React.PointerEvent<HTMLElement>): void => {
			const { currentTarget } = event;
			const tip = currentTarget.getAttribute(DATA_TIP_ATTRIBUTE);

			if (!tip) {
				return;
			}

			setMarkTooltip({ rect: currentTarget.getBoundingClientRect(), tip });
		},
		[],
	);

	const hideMarkTooltip = useCallback((): void => {
		setMarkTooltip(null);
	}, []);

	useEffect(() => {
		hideMarkTooltip();
	}, [hideMarkTooltip, resetKey]);

	useEffect(() => {
		window.addEventListener("scroll", hideMarkTooltip, true);
		window.addEventListener("resize", hideMarkTooltip);

		return (): void => {
			window.removeEventListener("scroll", hideMarkTooltip, true);
			window.removeEventListener("resize", hideMarkTooltip);
		};
	}, [hideMarkTooltip]);

	return { hideMarkTooltip, markTooltip, showMarkTooltip };
};

export { useMarkTooltip };
