import type { Metadata } from "next";

import {
	PhonemeDetailsPlan,
	type PhonemeDetailsPlanContent,
} from "@/components/phoneme-details-plan";

const STATIC_PHONEME_DETAILS: PhonemeDetailsPlanContent = {
	identity: {
		symbol: "ð",
		name: "Voiced dental fricative",
		category: "Consonant · voiced dental fricative",
		description:
			"Air flows continuously between your tongue and upper teeth while your vocal folds vibrate. Keep the contact light so the sound stays smooth and voiced.",
		mnemonic: "Think “this”, “breathe”, and every voiced th that links words together.",
	},
	playback: {
		mainSrc: "/audio/placeholder-phoneme.mp3",
		loopLabel: "Loop sound",
		statusMessage: "Loop off.",
		wordClips: [
			{
				id: "clip-this",
				word: "this",
				context: "Initial position",
				ipa: "ðɪs",
				src: "/audio/placeholder-this.mp3",
				note: "Function word that keeps the sound crisp at the start.",
			},
			{
				id: "clip-rather",
				word: "rather",
				context: "Medial position",
				ipa: "ˈɹæðɚ",
				src: "/audio/placeholder-rather.mp3",
				note: "Between vowels the airflow should stay steady and voiced.",
			},
			{
				id: "clip-breathe",
				word: "breathe",
				context: "Final position",
				ipa: "bɹið",
				src: "/audio/placeholder-breathe.mp3",
				note: "Carry the voicing all the way through the release.",
			},
			{
				id: "clip-gather",
				word: "gather",
				context: "Connected speech",
				ipa: "ˈɡæðɚ",
				src: "/audio/placeholder-gather.mp3",
				note: "Notice how the sound links smoothly into the vowel after it.",
			},
		],
	},
	production: {
		intro:
			"Move from placement to airflow in three controlled steps. Pause between steps to check your tongue position and voicing.",
		steps: [
			{
				id: "placement",
				title: "Place your tongue lightly on the upper teeth",
				description:
					"Let the tongue tip rest against the back of the top teeth. Keep a narrow channel so you can maintain steady airflow without blocking it.",
			},
			{
				id: "airflow",
				title: "Push a thin stream of air",
				description:
					"Exhale gently so the air brushes through the gap. You should hear a soft buzz rather than a strong hiss.",
			},
			{
				id: "voicing",
				title: "Add continuous voicing",
				description:
					"Engage your vocal folds as you sustain the airflow. If you touch your throat it should vibrate the entire time.",
			},
		],
		visuals: [
			{
				id: "diagram-placement",
				src: "/images/placeholder-ð-step1.png",
				alt: "Sagittal diagram showing tongue touching the upper teeth for /ð/ placement.",
				caption: "Tongue tip meets the upper teeth while the jaw stays relaxed.",
			},
			{
				id: "diagram-voicing",
				src: "/images/placeholder-ð-step2.png",
				alt: "Sagittal diagram showing airflow with vocal fold vibration for /ð/ production.",
				caption: "Air passes evenly between the teeth as the vocal folds vibrate.",
			},
		],
		commonMistake: {
			label: "Common pitfall",
			description:
				"Pressing too hard flattens the tongue and turns the sound into /d/. Ease the contact so air can slip through.",
		},
		sensoryCue: {
			label: "Feel the vibration",
			description:
				"Touch one finger behind your top teeth and another on your throat. You should sense a gentle buzz at both points when the sound is right.",
		},
	},
	spelling: {
		intro:
			"Function words almost always use voiced th. Scan for these graphemes when you expect the /ð/ sound.",
		patterns: [
			{
				id: "pattern-th",
				pattern: "th",
				frequency: "common",
				example: "this, that, those",
			},
			{
				id: "pattern-thvowel",
				pattern: "th + vowel ending",
				frequency: "common",
				example: "feather, either, bother",
			},
			{
				id: "pattern-thr",
				pattern: "thr",
				frequency: "occasional",
				example: "breathe, wreathe",
			},
			{
				id: "pattern-prefix",
				pattern: "other prefixes",
				frequency: "occasional",
				example: "though, therefore",
				isExtended: true,
			},
			{
				id: "pattern-loan",
				pattern: "loanword spellings",
				frequency: "rare",
				example: "dh in Sanskrit names like dharma",
				isExtended: true,
			},
		],
		exception: {
			label: "Watch out",
			description:
				'th can flip to /θ/ in stressed content words like "think"—don’t assume every th is voiced.',
		},
	},
	variations: {
		intro:
			"Context nudges the intensity but the sound should stay voiced. Use these notes to anticipate shifts.",
		items: [
			{
				id: "variation-linking",
				label: "Linking /ð/ between vowels",
				description:
					"When a vowel follows, keep the tongue in place and let the sound glide into the next syllable.",
				hasAudio: true,
			},
			{
				id: "variation-final",
				label: "Light final release",
				description:
					"Sentence-final /ð/ often fades softly—sustain the voicing without adding a /d/ burst.",
			},
			{
				id: "variation-reduction",
				label: "Unstressed reduction",
				description:
					"In quick speech it can lean toward a soft /θ/ or even disappear. Monitor airflow to keep the voiced quality.",
				hasAudio: true,
			},
			{
				id: "variation-emphasis",
				label: "Emphatic stress",
				description:
					"Stress can increase air pressure and make the sound hiss. Focus on vibration to keep the fricative smooth.",
			},
		],
	},
	examples: {
		intro: "Drill across word positions to cement spelling, IPA, and sound together.",
		items: [
			{
				id: "example-this",
				context: "initial",
				word: "this",
				ipa: "ðɪs",
				stress: "primary",
				src: "/audio/example-this.mp3",
				note: "High-frequency function word—perfect for daily shadowing.",
			},
			{
				id: "example-mother",
				context: "medial",
				word: "mother",
				ipa: "ˈmʌðɚ",
				stress: "primary",
				src: "/audio/example-mother.mp3",
				note: "Keep voicing as you move directly into the unstressed /ɚ/ ending.",
			},
			{
				id: "example-breathe",
				context: "final",
				word: "breathe",
				ipa: "briːð",
				stress: "primary",
				src: "/audio/example-breathe.mp3",
				note: "Sustain the vibration right to the end—no extra vowel afterwards.",
			},
		],
		sourceHighlight: {
			label: "Source word from contrast drill",
			word: "mother",
		},
	},
	contrasts: {
		intro:
			"Preview the neighbours that learners usually confuse before opening a full contrast session.",
		items: [
			{
				id: "contrast-theta",
				label: "/θ/ voiceless dental fricative",
				cue: "Same tongue position but no throat buzz. Try whispering to feel the difference.",
				samplePair: "thin · then",
			},
			{
				id: "contrast-d",
				label: "/d/ voiced alveolar stop",
				cue: "Tap the ridge with a quick stop then release. Feels like a momentary block.",
				samplePair: "doe · though",
			},
			{
				id: "contrast-z",
				label: "/z/ voiced alveolar fricative",
				cue: "Tongue shifts to the alveolar ridge and airflow increases. Listen for the stronger hiss.",
				samplePair: "zipping · this",
			},
		],
		link: {
			label: "Open contrast practice session",
			href: "#contrast-preview",
		},
	},
	tips: {
		intro: "Use compact drills to revisit the sound after feedback or between lessons.",
		items: [
			{
				id: "tip-loop-shadow",
				title: "Shadow the loop",
				summary:
					"Play the loop and speak with it three times—match the timing without over-squeezing airflow.",
				detail:
					"Start by mouthing the sound silently, then add voicing while the loop continues. If the buzz fades, reset the tongue placement and try again.",
				audioSrc: "/audio/tip-loop-shadow.mp3",
				selfCheck: "Feel vibration at the throat and teeth the whole time.",
			},
			{
				id: "tip-minimal-pair",
				title: "Contrast with /θ/",
				summary: "Alternate between “thin” and “then” to highlight the voicing change.",
				detail:
					"Say the pair slowly, touching your throat as you move between sounds. Aim for identical mouth shapes while turning voicing on for /ð/ only.",
				audioSrc: "/audio/tip-minimal-pair.mp3",
			},
			{
				id: "tip-syllable",
				title: "Embed in syllables",
				summary: "Practice with neutral syllables like “əðə” to stabilise the airflow.",
				detail:
					"Slide through three repetitions without pausing. Keep your jaw relaxed so the tongue can stay in position for each voiced release.",
				selfCheck: "No extra /d/ clicks between syllables.",
			},
		],
	},
};

export const metadata: Metadata = {
	title: "Phoneme details plan test",
	description: "Static test surface for the redesigned phoneme details component.",
};

export default function PhonemeDetailsTestPage() {
	return (
		<div className="flex flex-1 justify-center bg-muted/20 p-6">
			<PhonemeDetailsPlan content={STATIC_PHONEME_DETAILS} />
		</div>
	);
}
