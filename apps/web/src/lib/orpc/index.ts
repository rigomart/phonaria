import { createORPCReactQueryUtils } from "@orpc/react-query";
import { client } from "./client";

export const orpc = createORPCReactQueryUtils(client);

// Re-export for type-safe error handling
export { isDefinedError } from "@orpc/client";
