import { treaty } from "@elysiajs/eden";
import { app } from "../app/api/[[...slugs]]/route";

// Server: direct function calls (no network overhead)
// Client: HTTP requests to origin
export const api =
	typeof window === "undefined" ? treaty(app).api : treaty<typeof app>(window.location.origin).api;
