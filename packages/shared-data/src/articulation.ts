import type { ArticulationMannerInfo, ArticulationPlaceInfo } from "./types";

export const articulationPlaces: ArticulationPlaceInfo[] = [
	{
		key: "bilabial",
		label: "Bilabial",
		short: "Both lips come together to block then release or narrow airflow.",
		description:
			"Bilabial consonants are produced by bringing both lips together. Air is momentarily stopped or constricted at the lips, then released. English bilabials are typically easy for learners, though aspiration on /p/ can differ by language.",
		how: [
			"Bring both lips gently together (do not clench).",
			"Build up slight air pressure behind the closure (for stops).",
			"Release the lips to let air escape; add voicing for /b/ /m/.",
		],
		articulators: ["upper lip", "lower lip"],
		order: 1,
	},
	{
		key: "labiodental",
		label: "Labiodental",
		short: "Bottom lip lightly contacts upper front teeth allowing friction.",
		description:
			"Labiodental sounds use the lower lip against the upper front teeth, creating a narrow gap for turbulent airflow (fricatives). Learners may overbite or press too hard, reducing airflow.",
		how: [
			"Rest the inner edge of top teeth lightly on the lower lip.",
			"Force air through the narrow gap to create friction.",
			"Add voicing for /v/ by vibrating vocal folds.",
		],
		articulators: ["lower lip", "upper teeth"],
		order: 2,
	},
	{
		key: "dental",
		label: "Dental",
		short: "Tongue tip lightly touches upper teeth (or protrudes slightly).",
		description:
			"Dental fricatives in English (/θ/ /ð/) place the tongue tip lightly against or just between the upper and lower front teeth. Air passes over the tongue creating soft friction. Many learners substitute /t/ /s/ or /d/ /z/ due to absence in their L1.",
		how: [
			"Extend tongue tip to lightly touch upper front teeth edge.",
			"Keep sides of tongue relaxed for air to pass centrally.",
			"Blow air for /θ/; add voicing for /ð/.",
		],
		articulators: ["tongue tip", "upper teeth"],
		order: 3,
	},
	{
		key: "alveolar",
		label: "Alveolar",
		short: "Tongue tip/blade contacts or approaches ridge behind teeth.",
		description:
			"Alveolar sounds are formed with the tongue tip or blade at the alveolar ridge. English has stops (/t/ /d/), fricatives (/s/ /z/), nasals (/n/), and approximants (/l/ /ɹ/) here. Precise placement affects clarity especially for /t d n/ versus dental variants.",
		how: [
			"Lift tongue tip to alveolar ridge (bumpy area behind upper teeth).",
			"Create a full seal for stops; narrow gap for fricatives.",
			"Add nasal airflow by lowering velum for /n/.",
		],
		articulators: ["tongue tip", "alveolar ridge"],
		order: 4,
	},
	{
		key: "postalveolar",
		label: "Postalveolar",
		short: "Tongue blade just behind alveolar ridge; slightly retracted.",
		description:
			"Postalveolar fricatives (/ʃ/ /ʒ/) and affricates (/tʃ/ /dʒ/) use a retracted tongue blade and often lip rounding, creating a longer resonating cavity. Learners sometimes produce them as alveolar /s z/.",
		how: [
			"Raise tongue blade behind alveolar ridge (not touching hard palate).",
			"Shape tongue to form a shallow groove for air.",
			"Add quick stop + fricative release for affricates.",
		],
		articulators: ["tongue blade", "postalveolar region"],
		order: 5,
	},
	{
		key: "palatal",
		label: "Palatal",
		short: "Tongue front approximates hard palate without full closure.",
		description:
			"The palatal glide /j/ (as in 'yes') is produced with the front of the tongue approaching the hard palate, narrowing the space without creating turbulent friction.",
		how: [
			"Arch front of tongue toward hard palate.",
			"Keep sides lowered for smooth airflow.",
			"Add voicing throughout.",
		],
		articulators: ["tongue front", "hard palate"],
		order: 6,
	},
	{
		key: "velar",
		label: "Velar",
		short: "Back of tongue contacts soft palate (velum).",
		description:
			"Velar consonants (/k g ŋ/) are formed when the tongue dorsum contacts the velum. Timing voicing onset for /g/ can challenge learners whose L1 has different aspiration patterns.",
		how: [
			"Raise back of tongue to soft palate creating a seal (stops).",
			"Release for /k g/; keep velum lowered for nasal /ŋ/.",
			"Avoid adding a following intrusive vowel.",
		],
		articulators: ["tongue dorsum", "velum"],
		order: 7,
	},
	{
		key: "glottal",
		label: "Glottal",
		short: "Constriction at the vocal folds inside the larynx.",
		description:
			"Glottal sounds are articulated at the vocal folds. English /h/ is a breathy onset; the glottal stop [ʔ] appears as an allophone in some contexts (e.g., 'button').",
		how: [
			"For /h/ keep vocal folds open letting air pass noisily.",
			"For [ʔ] briefly close and release the vocal folds.",
		],
		articulators: ["vocal folds"],
		order: 8,
	},
];

export const articulationManners: ArticulationMannerInfo[] = [
	{
		key: "stop",
		label: "Stop (Plosive)",
		short: "Complete closure then release of airflow.",
		description:
			"Stops (plosives) involve a full closure in the vocal tract, building pressure which is then released in a burst. English distinguishes voiceless aspirated vs voiced timing at several places of articulation.",
		how: [
			"Create a complete closure at the place of articulation.",
			"Build slight air pressure behind the closure.",
			"Release quickly; add voicing for voiced stops.",
		],
		airflow: "Blocked then released explosively.",
		order: 1,
	},
	{
		key: "fricative",
		label: "Fricative",
		short: "Narrow passage creates continuous turbulent airflow.",
		description:
			"Fricatives are produced by forcing air through a narrow constriction, creating sustained turbulence. Precise tongue/lip shaping is critical for spectral distinction (/s/ vs /ʃ/).",
		how: [
			"Approach (do not seal) the articulators.",
			"Maintain a controlled narrow gap.",
			"Force steady airflow; add voicing when required.",
		],
		airflow: "Continuous turbulent stream.",
		order: 2,
	},
	{
		key: "affricate",
		label: "Affricate",
		short: "Stop closure releasing directly into a fricative.",
		description:
			"Affricates combine a stop and a fricative at (roughly) the same place of articulation. English /tʃ/ and /dʒ/ are postalveolar: a brief stop closure followed by a fricative release.",
		how: [
			"Begin with a complete stop closure.",
			"Release gradually into a narrow fricative channel.",
			"Coordinate timing so it feels like one blended sound.",
		],
		airflow: "Blocked then immediately turbulent.",
		order: 3,
	},
	{
		key: "nasal",
		label: "Nasal",
		short: "Air flows through nose while oral cavity is closed.",
		description:
			"Nasals open the velopharyngeal port allowing air through the nose while the mouth is blocked. English has three: /m n ŋ/. They are fully voiced and can become syllabic in certain contexts.",
		how: [
			"Seal oral cavity at place of articulation.",
			"Lower the velum to open nasal passage.",
			"Maintain voicing throughout.",
		],
		airflow: "Redirected through nasal cavity.",
		order: 4,
	},
	{
		key: "liquid",
		label: "Liquid (Approximant)",
		short: "Tongue shapes channel; minimal friction.",
		description:
			"Liquids (/l ɹ/) are sonorants with an open vocal tract. /l/ has lateral airflow around tongue sides; /ɹ/ involves a complex tongue shape (bunched or retroflex) without creating turbulent noise.",
		how: [
			"Shape tongue to allow air around (lateral) or over a central groove.",
			"Avoid creating a tight fricative constriction.",
			"Maintain voicing.",
		],
		airflow: "Mostly unobstructed, smooth.",
		order: 5,
	},
	{
		key: "glide",
		label: "Glide (Semivowel)",
		short: "Very open constriction transitions into a vowel.",
		description:
			"Glides (/j w/) have a tongue/lip position similar to vowels but move quickly into the following syllable nucleus. They cannot form syllable peaks in English.",
		how: [
			"Move articulators toward vowel-like target.",
			"Do not hold; transition rapidly into next sound.",
			"Keep voicing continuous.",
		],
		airflow: "Open, vowel-like.",
		order: 6,
	},
];
