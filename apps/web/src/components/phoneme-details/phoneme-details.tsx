import type { PhonemeSymbolId } from "shared-data";
import { cn } from "@/lib/utils";
import { PhonemeDetailsProvider } from "./phoneme-details-context";

type Props = React.ComponentProps<"div"> & {
	phonemeId: PhonemeSymbolId;
};

export function PhonemeDetails({ phonemeId, className, ...props }: Props) {
	return (
		<PhonemeDetailsProvider phonemeId={phonemeId}>
			<div className={cn("space-y-6 pb-5", className)} {...props} />
		</PhonemeDetailsProvider>
	);
}
