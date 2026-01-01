import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "./client";

export const orpc = createTanstackQueryUtils(client);

export { isDefinedError } from "@orpc/client";
export type {
	DictionaryLookupInput,
	G2PInput,
	G2PResponse,
	PhonemeSearchInput,
	PhonemeSearchOutput,
	WordDefinition,
} from "./types";
