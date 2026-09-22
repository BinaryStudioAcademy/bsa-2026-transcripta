type UseScanZoomReturn = {
	resetToTopLeft: () => void;
	scanRef: React.RefObject<HTMLDivElement | null>;
	zoom: number;
};

export { type UseScanZoomReturn };
