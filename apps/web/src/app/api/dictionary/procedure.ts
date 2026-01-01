import { wordDefinitionSchema } from "@/app/api/dictionary/model";
import { dictionaryQuerySchema, fetchWordDefinition } from "@/app/api/dictionary/service";
import { base } from "../_shared/base";
import { withRateLimit } from "../_shared/middleware/rate-limit";

export const lookup = base
	.use(withRateLimit)
	.input(dictionaryQuerySchema)
	.output(wordDefinitionSchema)
	.handler(async ({ input, context, errors }) => {
		const result = await fetchWordDefinition(input.word);
		await context.pending;

		if (!result) {
			throw errors.NOT_FOUND({ message: `No definition found for "${input.word}"` });
		}

		return result;
	});
