"use server";

import { ActionError, rateLimitedAction } from "@/lib/safe-action";
import { phonemeSearchQuerySchema } from "../_lib/phoneme-search/model";
import { searchPhonemes } from "../_lib/phoneme-search/service";

export const searchPhonemesAction = rateLimitedAction
	.metadata({ actionName: "phoneme-search" })
	.inputSchema(phonemeSearchQuerySchema)
	.action(async ({ parsedInput }) => {
		const result = await searchPhonemes(parsedInput.path, parsedInput.limit);

		if ("error" in result) {
			throw new ActionError(result.message, "INVALID_INPUT", {
				invalidLabels: result.invalidLabels,
			});
		}

		return result;
	});
