import { PERCENTAGE_MULTIPLIER } from "~/libs/constants/common.constants.js";
import { useCallback, useState } from "~/libs/hooks/hooks.js";

import {
	INITIAL_SPLIT_POSITION,
	MAX_SPLIT_POSITION,
	MIN_SPLIT_POSITION,
} from "../constants/verification.constants.js";

type UseResizableSplitReturn = {
	handleDividerPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
	handleDividerPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
	handleDividerPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
	isDragging: boolean;
	splitPosition: number;
};

const useResizableSplit = (): UseResizableSplitReturn => {
	const [splitPosition, setSplitPosition] = useState(INITIAL_SPLIT_POSITION);
	const [isDragging, setIsDragging] = useState(false);

	const handleDividerPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			event.currentTarget.setPointerCapture(event.pointerId);
			setIsDragging(true);
		},
		[],
	);

	const handleDividerPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isDragging) {
				return;
			}

			const workspace = event.currentTarget.parentElement;

			if (!workspace) {
				return;
			}

			const { left, width } = workspace.getBoundingClientRect();

			const position = ((event.clientX - left) / width) * PERCENTAGE_MULTIPLIER;

			setSplitPosition(
				Math.min(MAX_SPLIT_POSITION, Math.max(MIN_SPLIT_POSITION, position)),
			);
		},
		[isDragging],
	);

	const handleDividerPointerUp = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			setIsDragging(false);

			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
		},
		[],
	);

	return {
		handleDividerPointerDown,
		handleDividerPointerMove,
		handleDividerPointerUp,
		isDragging,
		splitPosition,
	};
};

export { useResizableSplit };
