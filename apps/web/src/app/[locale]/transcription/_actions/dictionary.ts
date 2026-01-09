"use server";

import { ActionError, rateLimitedAction } from "@/lib/safe-action";
import { dictionaryQuerySchema, fetchWordDefinition } from "../_lib/dictionary/service";

export const lookupDictionaryAction = rateLimitedAction
	.metadata({ actionName: "dictionary-lookup" })
	.inputSchema(dictionaryQuerySchema)
	.action(async ({ parsedInput }) => {
		const result = await fetchWordDefinition(parsedInput.word);

		if (!result) {
			throw new ActionError(`No definition found for "${parsedInput.word}"`, "NOT_FOUND");
		}

		return result;
	});
