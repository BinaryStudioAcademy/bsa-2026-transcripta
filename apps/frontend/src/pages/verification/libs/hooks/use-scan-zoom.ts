import { useEffect, useRef, useState } from "~/libs/hooks/hooks.js";

import {
	INITIAL_ZOOM,
	MAX_ZOOM,
	MIN_ZOOM,
	WHEEL_DELTA_THRESHOLD,
	ZOOM_IN_DIRECTION,
	ZOOM_OUT_DIRECTION,
	ZOOM_STEP,
} from "../constants/verification.constants.js";

type UseScanZoomReturn = {
	scanRef: React.RefObject<HTMLDivElement | null>;
	zoom: number;
};

const useScanZoom = (): UseScanZoomReturn => {
	const [zoom, setZoom] = useState(INITIAL_ZOOM);
	const scanReference = useRef<HTMLDivElement>(null);

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

				return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
			});
		};

		scanElement.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			scanElement.removeEventListener("wheel", handleWheel);
		};
	}, []);

	return {
		scanRef: scanReference,
		zoom,
	};
};

export { useScanZoom };
