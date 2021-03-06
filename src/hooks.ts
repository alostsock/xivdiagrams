import { useState, useEffect, useLayoutEffect } from 'react';

type CallbackRef = (el: HTMLElement | null) => void;

/**
 * Invoke a callback for pointerdown events that occur outside all tracked
 * elements
 */
export function useOnPointerDownOutside(callback: () => void) {
	const [containers, setContainers] = useState<HTMLElement[]>([]);

	const addRef: CallbackRef = (el) => {
		if (!el) return;

		// O(n), use Set or Map maybe?
		if (containers.every((c) => !c.isSameNode(el))) {
			setContainers([...containers, el]);
		}
	};

	useEffect(() => {
		if (!containers) return;

		const handlePointerDown = (e: PointerEvent) => {
			const target = e.target as Node | null;

			if (!target) return;

			if (containers.every((c) => !c.contains(target))) {
				callback();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [containers, callback]);

	return addRef;
}

// https://github.com/reach/reach-ui/blob/develop/packages/window-size/src/index.tsx
export function useWindowSize() {
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useLayoutEffect(() => {
		const resize = () =>
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		window.addEventListener('resize', resize);
		return () => window.removeEventListener('resize', resize);
	}, []);

	return dimensions;
}
