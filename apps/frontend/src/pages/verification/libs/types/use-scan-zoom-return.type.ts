type UseScanZoomReturn = {
	isZoomed: boolean;
	resetToTopLeft: () => void;
	scanRef: (node: HTMLDivElement | null) => void;
	toggleZoom: () => void;
	zoom: number;
};

export { type UseScanZoomReturn };
