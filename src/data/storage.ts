const storage = window.localStorage;
const keyLimit = 20;

type KeyCache = [planId: string, editKey: string][];

export function getAllKeys(): KeyCache | null {
	const keydata = storage.getItem('editKeys');
	return keydata ? (JSON.parse(keydata) as KeyCache) : null;
}

export function getKey(planId: string): string | null {
	const keycache = getAllKeys();
	const cached = keycache?.find(([id]) => id === planId);
	return cached?.[1] ?? null;
}

export function storeKey(planId: string, editKey: string) {
	const keycache = getAllKeys() || [];
	const cached = keycache?.find(
		([id, key]) => id === planId && key === editKey
	);
	if (!cached) {
		keycache.unshift([planId, editKey]);
		storage.setItem('editKeys', JSON.stringify(keycache.slice(0, keyLimit)));
	}
}

export function removeKey(planId: string) {
	const keycache = getAllKeys();
	if (!keycache) return;
	const index = keycache.findIndex(([id]) => id === planId);
	if (index !== -1) {
		keycache.splice(index, 1);
		storage.setItem('editKeys', JSON.stringify(keycache));
	}
}
