import { type PointerEvent, type RefObject } from "react";

import { FIRST_INDEX } from "~/libs/constants/constants.js";
import { useEffect, useRef, useState } from "~/libs/hooks/hooks.js";

import {
	PRIMARY_MOUSE_BUTTON,
	ZOOM_PAN_ADJUST,
} from "../constants/verification.constants.js";

type DragStart = {
	pointerX: number;
	pointerY: number;
};

type UseDragToPanParameters = {
	isEnabled: boolean;
	viewportReference: RefObject<HTMLDivElement | null>;
};

type UseDragToPanResult = {
	handlePointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
	handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
	handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void;
	handlePointerUp: (event: PointerEvent<HTMLDivElement>) => void;
	isDragging: boolean;
};

const useDragToPan = ({
	isEnabled,
	viewportReference,
}: UseDragToPanParameters): UseDragToPanResult => {
	const [isDragging, setIsDragging] = useState(false);
	const dragStartReference = useRef<DragStart | null>(null);

	useEffect(() => {
		if (!isEnabled) {
			return;
		}

		const viewport = viewportReference.current;

		if (!viewport) {
			return;
		}

		viewport.scrollLeft = FIRST_INDEX;
		viewport.scrollTop = FIRST_INDEX;
	}, [isEnabled, viewportReference]);

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
		if (!isEnabled || event.button !== PRIMARY_MOUSE_BUTTON) {
			return;
		}

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);

		dragStartReference.current = {
			pointerX: event.clientX,
			pointerY: event.clientY,
		};
		setIsDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
		const dragStart = dragStartReference.current;
		const viewport = viewportReference.current;

		if (!dragStart || !viewport) {
			return;
		}

		event.preventDefault();

		viewport.scrollLeft -=
			(event.clientX - dragStart.pointerX) / ZOOM_PAN_ADJUST;
		viewport.scrollTop -=
			(event.clientY - dragStart.pointerY) / ZOOM_PAN_ADJUST;
	};

	const finishDrag = (event: PointerEvent<HTMLDivElement>): void => {
		if (!dragStartReference.current) {
			return;
		}

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		dragStartReference.current = null;
		setIsDragging(false);
	};

	return {
		handlePointerCancel: finishDrag,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp: finishDrag,
		isDragging,
	};
};

export { useDragToPan };
