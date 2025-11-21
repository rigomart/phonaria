import type { PhonemeSymbolId } from "shared-data";
import { cn } from "@/lib/utils";
import { PhonemeDetailsProvider } from "./phoneme-details-context";

type Props = {
	phonemeId: PhonemeSymbolId;
	children: React.ReactNode;
};

export function PhonemeDetails({ phonemeId, children }: Props) {
	return <PhonemeDetailsProvider phonemeId={phonemeId}>{children}</PhonemeDetailsProvider>;
}

export function PhonemeDetailsContent({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("space-y-6 overflow-y-auto py-4", className)} {...props} />;
}
