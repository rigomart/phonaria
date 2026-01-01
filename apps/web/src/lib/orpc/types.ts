import type { InferClientInputs, InferClientOutputs } from "@orpc/client";
import type { client } from "./client";

/**
 * Type-safe API types inferred from the oRPC router client.
 *
 * @example
 * ```ts
 * // Good: Use inferred types from the router
 * import type { G2PResponse, WordDefinition } from "@/lib/orpc/types";
 *
 * // Bad: Don't import types directly from API model files
 * import type { G2PResponse } from "@/app/api/g2p/model";
 * ```
 */

type Outputs = InferClientOutputs<typeof client>;
type Inputs = InferClientInputs<typeof client>;

// G2P
export type G2PInput = Inputs["g2p"]["transcribe"];
export type G2PResponse = Outputs["g2p"]["transcribe"];

// Dictionary
export type DictionaryLookupInput = Inputs["dictionary"]["lookup"];
export type WordDefinition = Outputs["dictionary"]["lookup"];

// Phoneme search
export type PhonemeSearchInput = Inputs["phonemeSearch"]["search"];
export type PhonemeSearchOutput = Outputs["phonemeSearch"]["search"];
