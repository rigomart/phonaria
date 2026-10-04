/** Readonly at every level, preserving literal keys and tuple shapes. */
export type DeepReadonly<T> = T extends object
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T;

/** Protect package-owned plain objects and arrays once, at initialization. */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
	if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
		for (const nested of Object.values(value)) {
			deepFreeze(nested);
		}
		Object.freeze(value);
	}
	return value as DeepReadonly<T>;
}
