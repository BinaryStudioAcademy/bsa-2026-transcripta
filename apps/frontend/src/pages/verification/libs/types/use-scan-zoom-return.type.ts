type UseScanZoomReturn = {
	isZoomed: boolean;
	resetToTopLeft: () => void;
	scanRef: React.RefObject<HTMLDivElement | null>;
	toggleZoom: () => void;
	zoom: number;
};

export { type UseScanZoomReturn };
