import { wordDefinitionSchema } from "@/app/api/[[...slugs]]/dictionary/model";
import {
	dictionaryQuerySchema,
	fetchWordDefinition,
} from "@/app/api/[[...slugs]]/dictionary/service";
import { base } from "./base";
import { withRateLimit } from "./middleware/rate-limit";

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
