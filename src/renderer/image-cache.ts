import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';

/**
 * A cache for images that get rendered onto the canvas.
 * This prevents images from flickering on undo/redo, or when transitioning
 * between plan steps.
 *
 * Marks are OK to keep in the cache since they're SVGs (a few KB each, at
 * most), but arena images (~150-300 KB each) should be purged when not in use.
 */
class ImageCache {
	marks = new Map<string, HTMLImageElement>();
	arenas = new Map<string, HTMLImageElement>();

	get(url: string, type: 'mark' | 'arena'): HTMLImageElement {
		const cachedImage =
			type === 'mark' ? this.marks.get(url) : this.arenas.get(url);
		if (cachedImage) return cachedImage;

		const image = new Image();
		image.onload = () => diagram.render();
		image.src = url;

		if (type === 'mark') {
			this.marks.set(url, image);
		} else {
			this.arenas.set(url, image);
		}

		return image;
	}

	purge() {
		const arenaUrls = new Set();
		for (const step of plan.steps) {
			if (step.imageUrl) {
				arenaUrls.add(step.imageUrl);
			}
		}
		for (const url of this.arenas.keys()) {
			if (!arenaUrls.has(url)) {
				this.arenas.delete(url);
			}
		}
	}
}

export const imageCache = new ImageCache();
