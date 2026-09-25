import { useCallback, useEffect, useRef, useState } from "react";

type UseOverflowTooltipReturn<T extends HTMLElement> = {
	checkTruncation: () => void;
	elementRef: React.RefObject<T | null>;
	isTruncated: boolean;
};

const useOverflowTooltip = <T extends HTMLElement = HTMLElement>(
	dependency?: unknown,
): UseOverflowTooltipReturn<T> => {
	const elementRef = useRef<T | null>(null);
	const [isTruncated, setIsTruncated] = useState(false);

	const checkTruncation = useCallback((): void => {
		const element = elementRef.current;

		if (!element) {
			return;
		}

		setIsTruncated(element.scrollWidth > element.clientWidth);
	}, []);

	useEffect(() => {
		const element = elementRef.current;

		if (!element) {
			return;
		}

		checkTruncation();

		if (typeof ResizeObserver !== "undefined") {
			const resizeObserver = new ResizeObserver(() => {
				checkTruncation();
			});

			resizeObserver.observe(element);

			return (): void => {
				resizeObserver.disconnect();
			};
		}

		const handleResize = (): void => {
			checkTruncation();
		};

		window.addEventListener("resize", handleResize);

		return (): void => {
			window.removeEventListener("resize", handleResize);
		};
	}, [checkTruncation, dependency]);

	return {
		checkTruncation,
		elementRef,
		isTruncated,
	};
};

export { useOverflowTooltip };
