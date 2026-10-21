import type { JudgeThresholds } from "../judge";
import thresholds from "./judge-thresholds.json";

/** The judge's margins for Azure's scores, per target sound. Written by `bun run harness tune`. */
export const AZURE_JUDGE_THRESHOLDS: JudgeThresholds = thresholds as JudgeThresholds;
