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
		variant: "K O1 F I0",
		dictionary: "curated",
		reason:
			"Owner chose /ɔ/, listed first in standard American dictionaries, to match the app’s /ˈkɔfi/ and separate /ɔ/ phoneme.",
	},
	dogs: {
		variant: "D O1 G Z",
		dictionary: "curated",
		reason:
			"Owner chose /ɔ/, listed first in standard American dictionaries, to match the app’s /dɔɡz/ and separate /ɔ/ phoneme.",
	},
	hello: {
		variant: "H AX0 L OU1",
		dictionary: "curated",
		reason:
			"Reduced /həˈloʊ/ is Merriam-Webster’s first form, the first CMU form, and Phonaria Transcription’s form; preserve final stress.",
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
			"Reduced /ˈɹæbət/ is Merriam-Webster’s first form, the first CMU form, and Phonaria Transcription’s form; preserve initial stress.",
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

/** Reviewed choices for curated top-10k words; they win over the pronunciation rule. */
export const curatedPronunciations: Readonly<Record<string, { variant: string; reason: string }>> =
	{
		costume: {
			variant: "K A1 S T U0 M",
			reason:
				"Dictionaries stress the first syllable, /ˈkɑstum/; the first CMU form stresses the second.",
		},
		costumes: {
			variant: "K A1 S T U0 M Z",
			reason: "As costume.",
		},
		decade: {
			variant: "D E1 K EI0 D",
			reason:
				"Dictionaries stress the first syllable, /ˈdɛkeɪd/; the first CMU form stresses the second.",
		},
		decades: {
			variant: "D E1 K EI0 D Z",
			reason: "As decade.",
		},
		essay: {
			variant: "E1 S EI2",
			reason: "The noun stresses the first syllable, /ˈɛseɪ/; the first CMU form is the rare verb.",
		},
		essays: {
			variant: "E1 S EI2 Z",
			reason: "As essay.",
		},
		forbidden: {
			variant: "F ER0 B IX1 D AX0 N",
			reason:
				"/fɚˈbɪdən/, written by hand: one CMU form stresses for-, the other has an extra /ɹ/.",
		},
		kilometers: {
			variant: "K AX0 L A1 M AX0 T ER0 Z",
			reason: "/kəˈlɑmətɚz/, written by hand: the CMU form gives the third syllable a full /ʌ/.",
		},
		legit: {
			variant: "L AX0 J IX1 T",
			reason: "Stress on the second syllable, /ləˈdʒɪt/; the first CMU form stresses the first.",
		},
		outta: {
			variant: "AU1 T AX0",
			reason: "/ˈaʊtə/ as in out of; the first CMU form is /ˈutə/.",
		},
		presenter: {
			variant: "P R IX0 Z E1 N T ER0",
			reason: "Stress on the second syllable, /pɹɪˈzɛntɚ/; the first CMU form stresses the first.",
		},
		sometimes: {
			variant: "S AH1 M T AI2 M Z",
			reason:
				"Standard dictionaries stress the first syllable, /ˈsʌmˌtaɪmz/; the first CMU form S AX0 M T AI1 M Z reduces it.",
		},
	};
