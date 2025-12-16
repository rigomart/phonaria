import type { PhonemeSymbolId } from "@phonaria/phonetics-data";
import { cn } from "@/lib/utils";
import { PhonemeDetailsProvider, usePhonemeDetailsContext } from "./phoneme-details-context";

type Props = {
	phonemeId: PhonemeSymbolId;
	children: React.ReactNode;
};

export function PhonemeDetails({ phonemeId, children }: Props) {
	return <PhonemeDetailsProvider phonemeId={phonemeId}>{children}</PhonemeDetailsProvider>;
}

export function PhonemeDetailsContent({ className, ...props }: React.ComponentProps<"div">) {
	const { contentRef } = usePhonemeDetailsContext();
	return <div className={cn("space-y-6 overflow-y-auto", className)} {...props} ref={contentRef} />;
}
