import "server-only";
import { treaty } from "@elysiajs/eden";
import { app } from "@/app/api/[[...slugs]]/route";

// Server-only Eden client - direct function calls (no HTTP overhead)
export const api = treaty(app).api;
