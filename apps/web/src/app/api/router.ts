import { lookup } from "./dictionary/procedure";
import { transcribe } from "./g2p/procedure";
import { search } from "./phoneme-search/procedure";

export const router = {
	g2p: { transcribe },
	dictionary: { lookup },
	phonemeSearch: { search },
};

export type Router = typeof router;
