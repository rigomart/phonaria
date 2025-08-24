import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import g2pRouter from "./routes/g2p";
import healthRouter from "./routes/health";

type CloudflareBindings = {};

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Apply CORS middleware globally
app.use("/*", corsMiddleware);

// Mount route handlers
app.route("/", healthRouter);
app.route("/api/g2p", g2pRouter);

export default app;
