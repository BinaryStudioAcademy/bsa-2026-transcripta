import { PERCENTAGE_MULTIPLIER } from "~/libs/constants/common.constants.js";
import { useCallback, useEffect, useState } from "~/libs/hooks/hooks.js";
import { storage, StorageKey } from "~/libs/modules/storage/storage.js";

import {
	INITIAL_SPLIT_POSITION,
	MAX_SPLIT_POSITION,
	MIN_SPLIT_POSITION,
} from "../constants/verification.constants.js";
import { type UseResizableSplitReturn } from "../types/types.js";

const useResizableSplit = (): UseResizableSplitReturn => {
	const [splitPosition, setSplitPosition] = useState(INITIAL_SPLIT_POSITION);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const loadSplitPosition = async (): Promise<void> => {
			const storedPosition = await storage.get(
				StorageKey.VERIFICATION_SPLIT_POSITION,
			);

			if (storedPosition !== null) {
				const parsedPosition = Number(storedPosition);

				if (
					Number.isFinite(parsedPosition) &&
					parsedPosition >= MIN_SPLIT_POSITION &&
					parsedPosition <= MAX_SPLIT_POSITION
				) {
					setSplitPosition(parsedPosition);
				}
			}

			setIsLoaded(true);
		};

		void loadSplitPosition();
	}, []);

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		void storage.set(
			StorageKey.VERIFICATION_SPLIT_POSITION,
			String(splitPosition),
		);
	}, [splitPosition, isLoaded]);

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
