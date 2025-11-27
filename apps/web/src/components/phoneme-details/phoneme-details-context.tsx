import { createContext, use } from "react";
import type { PhonemeSymbolId } from "shared-data";

type PhonemeDetailsContextType = {
	phonemeId: PhonemeSymbolId;
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
	children,
}: {
	phonemeId: PhonemeSymbolId;
	children: React.ReactNode;
}) {
	return <PhonemeDetailsContext value={{ phonemeId }}>{children}</PhonemeDetailsContext>;
}
