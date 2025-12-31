import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "./client";

export const orpc = createTanstackQueryUtils(client);

// Re-export for type-safe error handling
export { isDefinedError } from "@orpc/client";
