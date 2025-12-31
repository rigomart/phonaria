import { lookup } from "./dictionary";
import { transcribe } from "./g2p";
import { search } from "./phoneme-search";

export const router = {
	g2p: { transcribe },
	dictionary: { lookup },
	phonemeSearch: { search },
};

export type Router = typeof router;
