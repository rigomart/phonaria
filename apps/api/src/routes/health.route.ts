import { Hono } from "hono";

const healthRouter = new Hono();

healthRouter.get("/", (c) => {
	return c.json({
		name: "Phonix G2P API",
		version: "0.0.1",
		endpoints: {
			"/api/g2p": "POST - Convert text to phonemic transcription",
		},
	});
});

export default healthRouter;
