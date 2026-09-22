import { useCallback, useEffect, useRef, useState } from "~/libs/hooks/hooks.js";

const PRIMARY_MOUSE_BUTTON = 0;

type DragStart = {
	pointerX: number;
	pointerY: number;
};

type UseDragToPanProperties = {
	isEnabled: boolean;
	viewportReference: React.RefObject<HTMLDivElement | null>;
};

type UseDragToPanReturn = {
	handlePointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
	isDragging: boolean;
};

const useDragToPan = ({
	isEnabled,
	viewportReference,
}: UseDragToPanProperties): UseDragToPanReturn => {
	const [isDragging, setIsDragging] = useState(false);
	const dragStartReference = useRef<DragStart | null>(null);

	useEffect(() => {
		if (!isEnabled) {
			setIsDragging(false);
			dragStartReference.current = null;
		}
	}, [isEnabled]);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isEnabled || event.button !== PRIMARY_MOUSE_BUTTON) {
				return;
			}

			const viewport = viewportReference.current;

			if (!viewport) {
				return;
			}

			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			dragStartReference.current = {
				pointerX: event.clientX,
				pointerY: event.clientY,
			};
			setIsDragging(true);
		},
		[isEnabled, viewportReference],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isEnabled || !isDragging || dragStartReference.current === null) {
				return;
			}

			const viewport = viewportReference.current;

			if (!viewport) {
				return;
			}

			const deltaX = event.clientX - dragStartReference.current.pointerX;
			const deltaY = event.clientY - dragStartReference.current.pointerY;

			viewport.scrollLeft -= deltaX;
			viewport.scrollTop -= deltaY;

			dragStartReference.current = {
				pointerX: event.clientX,
				pointerY: event.clientY,
			};
		},
		[isDragging, isEnabled, viewportReference],
	);

	const handlePointerUp = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}

			dragStartReference.current = null;
			setIsDragging(false);
		},
		[],
	);

	const handlePointerCancel = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}

			dragStartReference.current = null;
			setIsDragging(false);
		},
		[],
	);

	return {
		handlePointerCancel,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		isDragging,
	};
};

export { useDragToPan };
