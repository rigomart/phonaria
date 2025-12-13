import type { PhonemeDetailsCopy } from "./types";

const phonemeDetailsById: PhonemeDetailsCopy["phonemeDetailsById"] = {
	"voiceless-bilabial-plosive": {
		label: "Oclusiva bilabial sorda",
	},
	"voiced-bilabial-plosive": {
		label: "Oclusiva bilabial sonora",
	},
	"voiceless-alveolar-plosive": {
		label: "Oclusiva alveolar sorda",
	},
	"voiced-alveolar-plosive": {
		label: "Oclusiva alveolar sonora",
	},
	"voiced-velar-plosive": {
		label: "Oclusiva velar sonora",
	},
	"voiceless-velar-plosive": {
		label: "Oclusiva velar sorda",
	},
	"voiced-dental-fricative": {
		label: "Fricativa dental sonora",
	},
	"voiceless-dental-fricative": {
		label: "Fricativa dental sorda",
	},
	"voiceless-labiodental-fricative": {
		label: "Fricativa labiodental sorda",
	},
	"voiced-labiodental-fricative": {
		label: "Fricativa labiodental sonora",
	},
	"voiceless-glottal-fricative": {
		label: "Fricativa glotal sorda",
	},
	"voiceless-alveolar-fricative": {
		label: "Fricativa alveolar sorda",
	},
	"voiceless-postalveolar-fricative": {
		label: "Fricativa postalveolar sorda",
	},
	"voiced-alveolar-fricative": {
		label: "Fricativa alveolar sonora",
	},
	"voiced-postalveolar-fricative": {
		label: "Fricativa postalveolar sonora",
	},
	"voiced-postalveolar-affricate": {
		label: "Africada postalveolar sonora",
	},
	"voiceless-postalveolar-affricate": {
		label: "Africada postalveolar sorda",
	},
	"voiced-bilabial-nasal": {
		label: "Nasal bilabial sonora",
	},
	"voiced-alveolar-nasal": {
		label: "Nasal alveolar sonora",
	},
	"voiced-velar-nasal": {
		label: "Nasal velar sonora",
	},
	"voiced-alveolar-lateral-approximant": {
		label: "Aproximante lateral alveolar sonora",
	},
	"voiced-postalveolar-approximant": {
		label: "Aproximante postalveolar sonora",
	},
	"voiced-palatal-approximant": {
		label: "Aproximante palatal sonora",
	},
	"voiced-labial-velar-approximant": {
		label: "Aproximante labial-velar sonora",
	},
	"close-front-unrounded": {
		label: "Vocal cerrada anterior no redondeada",
	},
	"close-back-rounded": {
		label: "Vocal cerrada posterior redondeada",
	},
	"near-close-near-front-unrounded": {
		label: "Vocal casi cerrada casi anterior no redondeada",
	},
	"near-close-near-back-rounded": {
		label: "Vocal casi cerrada casi posterior redondeada",
	},
	"mid-central-unrounded": {
		label: "Vocal media central no redondeada",
	},
	"open-mid-front-unrounded": {
		label: "Vocal media abierta anterior no redondeada",
	},
	"open-mid-back-unrounded": {
		label: "Vocal media abierta posterior no redondeada",
	},
	"open-mid-back-rounded": {
		label: "Vocal media abierta posterior redondeada",
	},
	"near-open-front-unrounded": {
		label: "Vocal casi abierta anterior no redondeada",
	},
	"open-back-unrounded": {
		label: "Vocal abierta posterior no redondeada",
	},
	"close-mid-front-unrounded-to-near-close-near-front-unrounded": {
		label:
			"Diptongo de media cerrada anterior no redondeada a casi cerrada casi anterior no redondeada",
	},
	"close-mid-back-rounded-to-near-close-near-back-rounded": {
		label:
			"Diptongo de media cerrada posterior redondeada a casi cerrada casi posterior redondeada",
	},
	"open-front-unrounded-to-near-close-near-front-unrounded": {
		label: "Diptongo de abierta anterior no redondeada a casi cerrada casi anterior no redondeada",
	},
	"open-front-unrounded-to-near-close-near-back-rounded": {
		label: "Diptongo de abierta anterior no redondeada a casi cerrada casi posterior redondeada",
	},
	"open-mid-back-rounded-to-near-close-near-front-unrounded": {
		label:
			"Diptongo de media abierta posterior redondeada a casi cerrada casi anterior no redondeada",
	},
	"r-colored-open-mid-central": {
		label: "Vocal media abierta central rótica",
	},
};

const featureDefinitions: PhonemeDetailsCopy["featureDefinitions"] = {
	manner: {
		label: "Modo",
		description: "Cómo se modela el flujo de aire para producir el sonido",
		values: {
			plosive: {
				label: "Oclusiva",
				description: "El flujo de aire se detiene por completo y luego sale en una explosión.",
			},
			fricative: {
				label: "Fricativa",
				description: "El aire pasa por un canal estrecho y produce fricción.",
			},
			affricate: {
				label: "Africada",
				description: "Empieza con un cierre completo y luego se libera en fricción.",
			},
			nasal: {
				label: "Nasal",
				description: "El aire sale por la nariz en lugar de por la boca.",
			},
			approximant: {
				label: "Aproximante",
				description: "El aire fluye suavemente sin fricción, como una vocal.",
			},
			"lateral-approximant": {
				label: "Aproximante lateral",
				description:
					"La lengua bloquea el centro en el reborde alveolar, mientras el aire pasa por los lados.",
			},
		},
	},
	place: {
		label: "Lugar",
		description: "Dónde en la boca se produce el sonido",
		values: {
			bilabial: {
				label: "Bilabial",
				description: "Los dos labios se juntan para moldear el sonido.",
			},
			labiodental: {
				label: "Labiodental",
				description: "Los dientes superiores tocan el labio inferior.",
			},
			dental: {
				label: "Dental",
				description: "La punta de la lengua se acerca al borde de los dientes superiores.",
			},
			alveolar: {
				label: "Alveolar",
				description: "La lengua se acerca al reborde detrás de los dientes superiores.",
			},
			postalveolar: {
				label: "Postalveolar",
				description: "La lengua se eleva justo detrás del reborde alveolar.",
			},
			palatal: {
				label: "Palatal",
				description: "El cuerpo de la lengua se eleva hacia el paladar duro.",
			},
			velar: {
				label: "Velar",
				description: "La parte posterior de la lengua se eleva hacia el paladar blando.",
			},
			glottal: {
				label: "Glotal",
				description: "El sonido se produce en el espacio entre las cuerdas vocales.",
			},
			"labial-velar": {
				label: "Labial-velar",
				description: "Los labios se redondean mientras la parte posterior de la lengua se eleva.",
			},
		},
	},
	voicing: {
		label: "Sonoridad",
		description: "Si las cuerdas vocales vibran",
		values: {
			voiceless: {
				label: "Sorda",
				description: "Las cuerdas vocales no vibran; solo pasa aire.",
			},
			voiced: {
				label: "Sonora",
				description: "Las cuerdas vocales vibran; se siente un zumbido.",
			},
		},
	},
	height: {
		label: "Altura",
		description: "Qué tan alta está la lengua en la boca",
		values: {
			close: {
				label: "Cerrada",
				description: "La lengua está alta, con la mandíbula casi cerrada.",
			},
			"near-close": {
				label: "Casi cerrada",
				description: "La mandíbula se relaja un poco desde la posición cerrada.",
			},
			"close-mid": {
				label: "Media cerrada",
				description: "La mandíbula se abre un poco más que en la posición cerrada.",
			},
			mid: {
				label: "Media",
				description: "La mandíbula está en una posición neutra, de descanso.",
			},
			"open-mid": {
				label: "Media abierta",
				description: "La mandíbula baja a una posición media-baja.",
			},
			"near-open": {
				label: "Casi abierta",
				description: "La mandíbula está casi completamente abierta.",
			},
			open: {
				label: "Abierta",
				description: "La mandíbula baja; la boca queda bien abierta.",
			},
		},
	},
	backness: {
		label: "Anterioridad",
		description: "Qué tan hacia atrás está la lengua",
		values: {
			front: {
				label: "Anterior",
				description: "La lengua se adelanta en la boca.",
			},
			"near-front": {
				label: "Casi anterior",
				description: "La lengua está un poco más atrás que en la posición anterior.",
			},
			central: {
				label: "Central",
				description: "La lengua descansa en el centro de la boca.",
			},
			"near-back": {
				label: "Casi posterior",
				description: "La lengua se retrae un poco.",
			},
			back: {
				label: "Posterior",
				description: "La lengua se retrae bastante, hacia la garganta.",
			},
		},
	},
	roundness: {
		label: "Redondeamiento",
		description: "Si los labios están redondeados",
		values: {
			rounded: {
				label: "Redondeada",
				description: "Los labios forman un círculo.",
			},
			unrounded: {
				label: "No redondeada",
				description: "Los labios están relajados o estirados, como en una sonrisa.",
			},
		},
	},
	tenseness: {
		label: "Tensión",
		description: "Qué tan tensos están los músculos",
		values: {
			tense: {
				label: "Tensa",
				description: "Los músculos están tensos; el sonido dura más.",
			},
			lax: {
				label: "Relajada",
				description: "Los músculos están relajados; el sonido dura menos.",
			},
		},
	},
	rhoticity: {
		label: "Roticidad",
		description: "Si la vocal tiene coloración tipo /r/",
		values: {
			"r-colored": {
				label: "Rótica",
				description:
					"La lengua añade una cualidad sutil de /r/; la resonancia se mantiene central.",
			},
		},
	},
};

const diphthongTargetDefinitions: PhonemeDetailsCopy["diphthongTargetDefinitions"] = {
	targetHeight: {
		label: "Altura",
		description: "Posición vertical de la lengua al final del diptongo",
		values: {
			close: {
				label: "Cerrada",
				description: "La lengua está alta, cerca del paladar; la mandíbula casi cerrada.",
			},
			"near-close": {
				label: "Casi cerrada",
				description: "La lengua está alta pero relajada; la mandíbula un poco abierta.",
			},
			"close-mid": {
				label: "Media cerrada",
				description: "La lengua se sitúa en la parte alta-media de la boca.",
			},
			mid: {
				label: "Media",
				description: "La mandíbula está en una posición neutra, de descanso.",
			},
			"open-mid": {
				label: "Media abierta",
				description: "La mandíbula baja a una posición medio-baja.",
			},
			"near-open": {
				label: "Casi abierta",
				description: "La mandíbula está casi completamente abierta.",
			},
			open: {
				label: "Abierta",
				description: "La lengua está baja; la mandíbula baja y la boca se abre.",
			},
		},
	},
	targetBackness: {
		label: "Anterioridad",
		description: "Posición horizontal de la lengua al final del diptongo",
		values: {
			front: {
				label: "Anterior",
				description: "La lengua se adelanta en la boca.",
			},
			"near-front": {
				label: "Casi anterior",
				description: "La lengua está adelantada, pero algo retraída.",
			},
			central: {
				label: "Central",
				description: "La lengua descansa en el centro de la boca.",
			},
			"near-back": {
				label: "Casi posterior",
				description: "La lengua está atrás, pero no totalmente retraída.",
			},
			back: {
				label: "Posterior",
				description: "La lengua se retrae hacia el paladar blando.",
			},
		},
	},
	targetRoundness: {
		label: "Redondeamiento",
		description: "Redondeamiento de los labios al final del diptongo",
		values: {
			rounded: {
				label: "Redondeada",
				description: "Los labios forman un círculo.",
			},
			unrounded: {
				label: "No redondeada",
				description: "Los labios están relajados o estirados, como en una sonrisa.",
			},
		},
	},
};

const allophoneContextDefinitions: PhonemeDetailsCopy["allophoneContextDefinitions"] = {
	"stressed-onset-aspirated": {
		name: "Aspirada",
		description: "Se libera con una bocanada de aire",
		when: "Al inicio de sílabas acentuadas",
	},
	"after-s-onset-unaspirated": {
		name: "No aspirada",
		description: "Se libera sin esa bocanada de aire",
		when: "Después de /s/ al inicio de una sílaba",
	},
	"vowel-to-vowel-flap": {
		name: "Golpe (flap)",
		description: "Toque rápido con la punta de la lengua",
		when: "Entre vocales, en el habla informal",
	},
	"t-before-syllabic-n-glottal": {
		name: "Oclusión glotal",
		description: "Cierre breve en la garganta",
		when: "Antes de /n/ silábica (como en 'button')",
	},
	"coda-dark-l": {
		name: "L oscura",
		description: "Se produce con la parte posterior de la lengua elevada",
		when: "Al final de sílaba o antes de consonantes",
	},
	"pre-voiced-coda-lengthened": {
		name: "Alargada",
		description: "Se mantiene un poco más",
		when: "Antes de consonantes sonoras como /d/, /b/, /v/",
	},
	"pre-voiceless-coda-shorter": {
		name: "Acortada",
		description: "Se mantiene un poco menos",
		when: "Antes de consonantes sordas como /t/, /p/, /f/",
	},
	"stressed-r-colored": {
		name: "Rótica acentuada",
		description: "Vocal rótica acentuada, con coloración /r/ completa",
		when: "En sílabas acentuadas",
	},
	"unstressed-r-colored": {
		name: "Rótica no acentuada",
		description: "Vocal rótica reducida, con una coloración /r/ más ligera",
		when: "En sílabas no acentuadas (sobre todo al final de palabra en -er)",
	},
};

export const phonemeDetailsCopyEs: PhonemeDetailsCopy = {
	phonemeDetailsById,
	featureDefinitions,
	diphthongTargetDefinitions,
	allophoneContextDefinitions,
};
