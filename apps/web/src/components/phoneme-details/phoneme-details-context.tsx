import type { PhonemeSymbolId, TargetLanguage } from "@phonaria/phonetics-data";
import { createContext, use, useRef } from "react";

type PhonemeDetailsContextType = {
	phonemeId: PhonemeSymbolId;
	targetLanguage: TargetLanguage;
	contentRef: React.RefObject<HTMLDivElement | null>;
};

const PhonemeDetailsContext = createContext<PhonemeDetailsContextType | null>(null);

export function usePhonemeDetailsContext() {
	const context = use(PhonemeDetailsContext);
	if (!context) {
		throw new Error("usePhonemeDetailsContext must be used within a PhonemeDetailsProvider");
	}
	return context;
}

export function PhonemeDetailsProvider({
	phonemeId,
	targetLanguage,
	children,
}: {
	phonemeId: PhonemeSymbolId;
	targetLanguage: TargetLanguage;
	children: React.ReactNode;
}) {
	const contentRef = useRef<HTMLDivElement | null>(null);
	return (
		<PhonemeDetailsContext value={{ phonemeId, targetLanguage, contentRef }}>
			{children}
		</PhonemeDetailsContext>
	);
}
