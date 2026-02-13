import type { PhonemeSymbolId, TargetAccent } from "@phonaria/phonetics-data";
import { createContext, use, useRef } from "react";

type PhonemeDetailsContextType = {
	phonemeId: PhonemeSymbolId;
	targetAccent: TargetAccent;
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
	targetAccent,
	children,
}: {
	phonemeId: PhonemeSymbolId;
	targetAccent: TargetAccent;
	children: React.ReactNode;
}) {
	const contentRef = useRef<HTMLDivElement | null>(null);
	return (
		<PhonemeDetailsContext value={{ phonemeId, targetAccent, contentRef }}>
			{children}
		</PhonemeDetailsContext>
	);
}
