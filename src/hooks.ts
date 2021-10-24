import { useEffect, useState } from 'react';

type CallbackRef = (el: HTMLElement | null) => void;

export function useOnPointerDownOutside(callback: () => void) {
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const callbackRef: CallbackRef = (el) => el && setContainer(el);

	useEffect(() => {
		if (!container) return;

		const handlePointerDown = (e: PointerEvent) => {
			if (e.target && !container.contains(e.target as Node)) {
				callback();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [container, callback]);

	return callbackRef;
}
