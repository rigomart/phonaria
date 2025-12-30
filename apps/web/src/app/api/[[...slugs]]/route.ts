import { Elysia } from "elysia";
import { dictionary } from "./dictionary";
import { g2p } from "./g2p";
import { phonemeSearch } from "./phoneme-search";

export const app = new Elysia({ prefix: "/api" }).use(dictionary).use(g2p).use(phonemeSearch);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
