import { useCallback, useEffect, useRef, useState } from "~/libs/hooks/hooks.js";

import {
	INITIAL_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	WHEEL_DELTA_THRESHOLD,
	ZOOM_IN_DIRECTION,
	ZOOM_OUT_DIRECTION,
	ZOOM_PAN_RESET,
	ZOOM_STEP,
} from "../constants/verification.constants.js";
import { type UseScanZoomReturn } from "../types/use-scan-zoom-return.type.js";

const useScanZoom = (): UseScanZoomReturn => {
	const [zoom, setZoom] = useState(INITIAL_ZOOM);
	const scanReference = useRef<HTMLDivElement>(null);

	const resetToTopLeft = useCallback((): void => {
		const scanElement = scanReference.current;

		if (!scanElement) {
			return;
		}

		scanElement.scrollLeft = ZOOM_PAN_RESET;
		scanElement.scrollTop = ZOOM_PAN_RESET;
	}, []);

	useEffect(() => {
		const scanElement = scanReference.current;

		if (!scanElement) {
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
				const clampedZoom = Math.min(
					MAX_ZOOM,
					Math.max(MIN_ZOOM, nextZoom),
				);

				if (clampedZoom > INITIAL_ZOOM) {
					resetToTopLeft();
				}

				return clampedZoom;
			});
		};

		scanElement.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			scanElement.removeEventListener("wheel", handleWheel);
		};
	}, [resetToTopLeft]);

	return {
		resetToTopLeft,
		scanRef: scanReference,
		zoom,
	};
};

export { useScanZoom };
