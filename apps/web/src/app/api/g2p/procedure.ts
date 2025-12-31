import { g2pRequestSchema, g2pResponseSchema } from "@/app/api/g2p/model";
import { processG2P } from "@/app/api/g2p/service";
import { base } from "../_shared/base";
import { withRateLimit } from "../_shared/middleware/rate-limit";

export const transcribe = base
	.use(withRateLimit)
	.input(g2pRequestSchema)
	.output(g2pResponseSchema)
	.handler(async ({ input, context }) => {
		const result = await processG2P(input.text);
		await context.pending; // Wait for rate limit analytics
		return result;
	});
