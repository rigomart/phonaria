import "client-only";
import { treaty } from "@elysiajs/eden";
import type { App } from "@/app/api/[[...slugs]]/route";

// Client-side Eden client - makes HTTP requests
// For server components, use "@/lib/eden/server" for direct calls without HTTP overhead
export const api = treaty<App>(
	typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
).api;
