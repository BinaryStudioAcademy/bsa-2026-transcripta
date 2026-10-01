import { createPortal } from "react-dom";

import { useLayoutEffect, useRef, useState } from "~/libs/hooks/hooks.js";

import { getMarkTooltipPosition } from "../helpers/get-mark-tooltip-position.helper.js";
import {
	type MarkTooltipPosition,
	type MarkTooltipState,
} from "../types/types.js";

type MarkTooltipProperties = {
	markTooltip: MarkTooltipState | null;
};

const MarkTooltip: React.FC<MarkTooltipProperties> = ({
	markTooltip,
}: MarkTooltipProperties) => {
	const bubbleReference = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<MarkTooltipPosition | null>(null);

	useLayoutEffect(() => {
		const bubble = bubbleReference.current;

		if (!markTooltip || !bubble) {
			setPosition(null);

			return;
		}

		const { height, width } = bubble.getBoundingClientRect();

		setPosition(
			getMarkTooltipPosition({
				anchor: markTooltip.rect,
				bubble: { height, width },
			}),
		);
	}, [markTooltip]);

	if (!markTooltip) {
		return null;
	}

	return createPortal(
		<div
			className="verification-mark-tooltip"
			ref={bubbleReference}
			role="tooltip"
			style={
				position
					? {
							left: `${String(position.left)}px`,
							top: `${String(position.top)}px`,
						}
					: undefined
			}
		>
			{markTooltip.tip}
		</div>,
		document.body,
	);
};

export { MarkTooltip };
