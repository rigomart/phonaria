import { defineConfig } from "drizzle-kit";
import "./envConfig.ts";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dialect: "turso",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL || "",
		authToken: process.env.TURSO_AUTH_TOKEN || "",
	},
	casing: "snake_case",
});
