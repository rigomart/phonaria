"use client";

import { createContext, useContext } from "react";
import type { IpaPhoneme } from "shared-data";

type Layout = "compact" | "comfortable" | "full";

interface PhonemeDetailsContextValue {
	phoneme: IpaPhoneme;
	layout: Layout;
	maxExamples: number;
	maxContrasts: number;
}

const PhonemeDetailsContext = createContext<PhonemeDetailsContextValue | null>(null);

export function usePhonemeDetailsContext() {
	const ctx = useContext(PhonemeDetailsContext);
	if (!ctx) {
		throw new Error("PhonemeDetails compound components must be used within PhonemeDetails");
	}
	return ctx;
}

interface PhonemeDetailsProps {
	phoneme: IpaPhoneme;
	layout?: Layout;
	maxExamples?: number;
	maxContrasts?: number;
	children: React.ReactNode;
}

export function PhonemeDetails({
	phoneme,
	layout = "comfortable",
	maxExamples = 6,
	maxContrasts = 3,
	children,
}: PhonemeDetailsProps) {
	return (
		<PhonemeDetailsContext.Provider value={{ phoneme, layout, maxExamples, maxContrasts }}>
			<div className="space-y-4">{children}</div>
		</PhonemeDetailsContext.Provider>
	);
}

export { PhonemeDetailsExamplesGrid } from "./examples-grid";
export { PhonemeDetailsHeader } from "./header";
export { PhonemeDetailsTabs } from "./tabs-container";
