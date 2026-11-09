import list from "../../../data/en/word-page-list.json";
import { deepFreeze } from "../../shared/readonly";

/**
 * The words that have a page at /words/<word>, lowercase, most notable first. A file of
 * their own, so a bundle that only links to the pages leaves out their data, which is in
 * `EnglishWordPages` (`@phonaria/phonetics-data/data/en/word-pages`).
 */
export const EnglishWordPageList = deepFreeze(list) as readonly string[];
