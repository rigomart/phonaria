/**
 * Saved Azure responses for recordings scored against *ship*, from the wrong-word
 * investigation (#344): the assessment with `EnableMiscue` on, and plain
 * recognition of the same audio. Catalog Jenny for *ship* and *sheep*, Jenny TTS
 * for *kid*, *ships* and "a ship", and two seconds of digital silence.
 */
import type { AzureAssessmentResponse, AzureRecognitionResponse } from "../../response";
import aShipAsShip from "./a-ship-as-ship.assessment.json";
import aShip from "./a-ship.recognition.json";
import bidAsBid from "./bid-as-bid.assessment.json";
import bidEmpty from "./bid-empty.recognition.json";
import kidAsShip from "./kid-as-ship.assessment.json";
import kid from "./kid.recognition.json";
import sheepAsShip from "./sheep-as-ship.assessment.json";
import sheep from "./sheep.recognition.json";
import shipAsShip from "./ship-as-ship.assessment.json";
import ship from "./ship.recognition.json";
import shipsAsShip from "./ships-as-ship.assessment.json";
import ships from "./ships.recognition.json";
import silenceAsShip from "./silence-as-ship.assessment.json";
import silence from "./silence.recognition.json";

export type MiscueFixture = {
	readonly assessment: AzureAssessmentResponse;
	readonly recognition: AzureRecognitionResponse;
};

/** Keyed by what was said. */
export const MISCUE_FIXTURES = {
	ship: { assessment: shipAsShip, recognition: ship },
	sheep: { assessment: sheepAsShip, recognition: sheep },
	kid: { assessment: kidAsShip, recognition: kid },
	ships: { assessment: shipsAsShip, recognition: ships },
	"a ship": { assessment: aShipAsShip, recognition: aShip },
	silence: { assessment: silenceAsShip, recognition: silence },
} satisfies Record<string, MiscueFixture>;

/**
 * A short TTS *bid* from the five-voice run (#354): the assessment heard and scored
 * the word, but plain recognition of the same audio answered `Success` with an empty
 * transcript, as it does for most clips of 650–675 ms (#384).
 */
export const EMPTY_TRANSCRIPT_FIXTURE = {
	assessment: bidAsBid,
	recognition: bidEmpty,
} satisfies MiscueFixture;
