/**
 * Next.js adapter for loading `.env*` files into process.env.
 * Temporary migration boundary used by drizzle-kit. Application runtime
 * configuration lives in `src/lib/site.ts`.
 */
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);
