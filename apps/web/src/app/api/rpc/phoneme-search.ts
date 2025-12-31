import {
	phonemeSearchQuerySchema,
	phonemeSearchResponseSchema,
} from "@/app/api/services/phoneme-search/model";
import { searchPhonemes } from "@/app/api/services/phoneme-search/service";
import { base } from "./base";
import { withRateLimit } from "./middleware/rate-limit";

export const search = base
	.use(withRateLimit)
	.input(phonemeSearchQuerySchema)
	.output(phonemeSearchResponseSchema)
	.handler(async ({ input, context, errors }) => {
		const result = await searchPhonemes(input.path, input.limit);
		await context.pending;

		if ("error" in result) {
			throw errors.INVALID_INPUT({
				message: result.message,
				data: { details: result.invalidLabels?.join(", ") },
			});
		}

		return result;
	});
