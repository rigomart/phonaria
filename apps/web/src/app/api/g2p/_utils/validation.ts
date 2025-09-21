import { g2pRequestSchema } from "../_schemas/g2p-api.schema";

export function validateRequest(body: unknown) {
	return g2pRequestSchema.safeParse(body);
}

export function isValidText(text: string): boolean {
	return Boolean(text && text.trim().length > 0);
}
