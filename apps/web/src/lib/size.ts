export function ensureNotTooLarge(sizeInBytes: number, maxBytes: number, label = "Payload"): void {
	if (sizeInBytes > maxBytes) {
		throw new Error(`${label} too large`);
	}
}

export function ensureHeaderNotTooLarge(
	contentLengthHeader: string | null,
	maxBytes: number,
	label = "Payload",
): void {
	if (!contentLengthHeader) return;
	const value = Number(contentLengthHeader);
	if (Number.isFinite(value)) {
		ensureNotTooLarge(value, maxBytes, label);
	}
}
