const storage = window.localStorage;
const keyLimit = 20;

type KeyCache = [planId: string, editKey: string][];

export function getAllKeys(): KeyCache | null {
	const keydata = storage.getItem('editKeys');
	return keydata ? (JSON.parse(keydata) as KeyCache) : null;
}

export function getKey(planId: string): string | null {
	const keycache = getAllKeys();
	if (!keycache) return null;

	// move recently used keys to the front
	const cached = removeKey(planId);
	if (!cached) return null;
	storeKey(...cached);
	return cached[1];
}

export function storeKey(planId: string, editKey: string): void {
	const keycache = getAllKeys() || [];
	if (!keycache) return;

	const cached = keycache.find(([id, key]) => id === planId && key === editKey);
	if (!cached) {
		keycache.unshift([planId, editKey]);
		storage.setItem('editKeys', JSON.stringify(keycache.slice(0, keyLimit)));
	}
}

export function removeKey(
	planId: string
): [planId: string, editKey: string] | null {
	const keycache = getAllKeys();
	if (!keycache) return null;

	const index = keycache.findIndex(([id]) => id === planId);
	if (index !== -1) {
		const [removed] = keycache.splice(index, 1);
		storage.setItem('editKeys', JSON.stringify(keycache));
		return removed;
	} else {
		return null;
	}
}
