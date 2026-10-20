/**
 * Reads a request body, stopping as soon as it passes `maxBytes`. Returns null for a
 * body that's too long, whether declared by `Content-Length` or found while reading.
 */
export async function readBody(
	request: Request,
	maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
	const declared = Number(request.headers.get("content-length"));
	if (declared > maxBytes) return null;
	if (!request.body) return new Uint8Array(0);

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}
	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body;
}
