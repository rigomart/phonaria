type ReviewedPronunciation = {
	variant: string;
	dictionary: "curated" | "full";
	reason: string;
};

/** Reviewed CMU pronunciations expressed in Phonaria's internal tokens. */
export const spellingPronunciations: Readonly<Record<string, ReviewedPronunciation>> = {
	be: {
		variant: "B I1",
		dictionary: "curated",
		reason: "Stressed citation form teaches e → /i/; reject reduced B I0.",
	},
	cause: {
		variant: "K O1 Z",
		dictionary: "curated",
		reason: "au teaches /ɔ/; reject the merged /ɑ/ form K A1 Z.",
	},
	coffee: {
		variant: "K A1 F I0",
		dictionary: "curated",
		reason: "Both K A1 F I0 and K O1 F I0 teach ff → /f/; keep the first CMU American form.",
	},
	dogs: {
		variant: "D A1 G Z",
		dictionary: "curated",
		reason: "Both D A1 G Z and D O1 G Z teach final s → /z/; keep the first CMU American form.",
	},
	hello: {
		variant: "H AX0 L OU1",
		dictionary: "curated",
		reason:
			"Both H AX0 L OU1 and H E0 L OU1 teach h → /h/ and ll → /l/; keep the first CMU citation form, with final stress.",
	},
	her: {
		variant: "H ER1",
		dictionary: "curated",
		reason: "Stressed citation form teaches er → /ɝ/; reject reduced H ER0 (/ɚ/).",
	},
	jeep: {
		variant: "J I1 P",
		dictionary: "full",
		reason: "Bundled full CMU JEEP has only J I1 P; j teaches /dʒ/. Missing from curated top-10k.",
	},
	new: {
		variant: "N U1",
		dictionary: "curated",
		reason: "ew teaches /u/; first CMU American N U1 avoids the extra /j/ in N Y U1.",
	},
	rabbit: {
		variant: "R AE1 B AX0 T",
		dictionary: "curated",
		reason:
			"Both R AE1 B AX0 T and R AE1 B IX0 T teach bb → /b/; keep the first CMU citation form, with initial stress.",
	},
	rained: {
		variant: "R EI1 N D",
		dictionary: "full",
		reason:
			"Bundled full CMU RAINED has only R EI1 N D; voiced -ed teaches /d/. Missing from curated top-10k.",
	},
	this: {
		variant: "DH IX1 S",
		dictionary: "curated",
		reason: "Stressed citation form teaches th → /ð/; reject unstressed DH IX0 S.",
	},
	top: {
		variant: "T A1 P",
		dictionary: "curated",
		reason:
			"Both T A1 P and T O1 P teach t → /t/; keep the first CMU American form, matching the example's /ɑ/.",
	},
	yoke: {
		variant: "Y OU1 K",
		dictionary: "full",
		reason: "Bundled full CMU YOKE has only Y OU1 K; y teaches /j/. Missing from curated top-10k.",
	},
};
