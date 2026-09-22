type UseResizableSplitReturn = {
	handleDividerPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
	handleDividerPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
	handleDividerPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
	isDragging: boolean;
	splitPosition: number;
};

export { type UseResizableSplitReturn };
