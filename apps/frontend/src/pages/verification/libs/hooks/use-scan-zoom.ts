import { useCallback, useEffect, useState } from "~/libs/hooks/hooks.js";

import {
	INITIAL_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	TOGGLE_ZOOM_LEVEL,
	WHEEL_DELTA_THRESHOLD,
	ZOOM_IN_DIRECTION,
	ZOOM_OUT_DIRECTION,
	ZOOM_PAN_RESET,
	ZOOM_STEP,
} from "../constants/verification.constants.js";
import { type UseScanZoomReturn } from "../types/types.js";

const useScanZoom = (): UseScanZoomReturn => {
	const [zoom, setZoom] = useState(INITIAL_ZOOM);
	const [scanNode, setScanNode] = useState<HTMLDivElement | null>(null);
	const scanReference = useCallback((node: HTMLDivElement | null): void => {
		setScanNode(node);
	}, []);
	const isZoomed = zoom > INITIAL_ZOOM;

	const resetToTopLeft = useCallback((): void => {
		const scanElement = scanNode?.parentElement;

		if (!scanElement) {
			return;
		}

		scanElement.scrollLeft = ZOOM_PAN_RESET;
		scanElement.scrollTop = ZOOM_PAN_RESET;
	}, [scanNode]);

	const toggleZoom = useCallback((): void => {
		setZoom((previousZoom) => {
			const nextZoom =
				previousZoom > INITIAL_ZOOM ? INITIAL_ZOOM : TOGGLE_ZOOM_LEVEL;

			if (nextZoom > INITIAL_ZOOM) {
				resetToTopLeft();
			}

			return nextZoom;
		});
	}, [resetToTopLeft]);

	useEffect(() => {
		if (!scanNode) {
			return;
		}

		const handleWheel = (event: WheelEvent): void => {
			event.preventDefault();

			setZoom((previousZoom) => {
				const zoomDirection =
					event.deltaY < WHEEL_DELTA_THRESHOLD
						? ZOOM_IN_DIRECTION
						: ZOOM_OUT_DIRECTION;

				const nextZoom = previousZoom + zoomDirection * ZOOM_STEP;
				const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

				if (previousZoom === INITIAL_ZOOM && clampedZoom > INITIAL_ZOOM) {
					resetToTopLeft();
				}

				return clampedZoom;
			});
		};

		scanNode.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			scanNode.removeEventListener("wheel", handleWheel);
		};
	}, [scanNode, resetToTopLeft]);

	return {
		isZoomed,
		resetToTopLeft,
		scanRef: scanReference,
		toggleZoom,
		zoom,
	};
};

export { useScanZoom };
