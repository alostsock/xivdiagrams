/**
 * From T, make optional all properties whose keys are in the union K
 */
type PartialBy<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
	Partial<Pick<T, K>>;
