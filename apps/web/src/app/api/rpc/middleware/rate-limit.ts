import { checkRateLimit } from "@/app/api/[[...slugs]]/_shared/rate-limit";
import { base } from "../base";

export const withRateLimit = base.middleware(async ({ context, next, errors }) => {
	const { isRateLimited, pending, resetMs } = await checkRateLimit(context.request);

	if (isRateLimited) {
		await pending;
		throw errors.RATE_LIMITED({
			data: { retryAfter: Math.ceil((resetMs - Date.now()) / 1000) },
		});
	}

	return next({ context: { pending } });
});
