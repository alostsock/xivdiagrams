export function throttleAndDebounce(
	callback: () => void,
	throttleMs: number,
	debounceMs: number
) {
	let resize: ReturnType<typeof setTimeout> | null = null;
	let previous: number | null = null;

	return () => {
		// throttle
		const now = performance.now();
		if (!previous || now - previous > throttleMs) {
			previous = now;
			callback();
		}

		// debounce
		if (resize) clearTimeout(resize);
		resize = setTimeout(() => callback(), debounceMs);
	};
}
