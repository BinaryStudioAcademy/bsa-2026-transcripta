import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "~/libs/hooks/hooks.js";

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
	const scanReference = useRef<HTMLDivElement>(null);
	const isZoomed = zoom > INITIAL_ZOOM;

	const resetToTopLeft = useCallback((): void => {
		const scanElement = scanReference.current?.parentElement;

		if (!scanElement) {
			return;
		}

		scanElement.scrollLeft = ZOOM_PAN_RESET;
		scanElement.scrollTop = ZOOM_PAN_RESET;
	}, []);

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
				const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

				if (previousZoom === INITIAL_ZOOM && clampedZoom > INITIAL_ZOOM) {
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
		isZoomed,
		resetToTopLeft,
		scanRef: scanReference,
		toggleZoom,
		zoom,
	};
};

export { useScanZoom };
