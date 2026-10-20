"use client";

/** The opt-in for sharing scoring evidence (#336), off until the learner turns it on and remembered in this browser. */
import { Switch } from "@phonaria/ui/components/switch";
import { useEffect, useId } from "react";
import { EvidenceLogNotice } from "@/lib/speech/evidence-log";
import { useEvidenceLogConsent, watchEvidenceLogConsent } from "@/lib/speech/evidence-log-consent";

export function EvidenceLogSetting() {
	const enabled = useEvidenceLogConsent((state) => state.enabled);
	const setEnabled = useEvidenceLogConsent((state) => state.setEnabled);
	const load = useEvidenceLogConsent((state) => state.load);

	useEffect(() => {
		load();
		return watchEvidenceLogConsent();
	}, [load]);

	return <EvidenceLogSwitch enabled={enabled} onChange={setEnabled} />;
}

export function EvidenceLogSwitch({
	enabled,
	onChange,
}: {
	enabled: boolean;
	onChange: (enabled: boolean) => void;
}) {
	const id = useId();
	return (
		<label
			className="mt-3 flex max-w-xs cursor-pointer items-start gap-3 text-left"
			htmlFor={`${id}-switch`}
		>
			<Switch
				aria-describedby={`${id}-description`}
				aria-labelledby={`${id}-label`}
				checked={enabled}
				className="mt-0.5"
				// Base UI puts the id on its hidden checkbox, which the label then toggles.
				id={`${id}-switch`}
				onCheckedChange={(checked) => onChange(checked)}
				size="sm"
			/>
			<span className="flex flex-col gap-1 text-xs">
				<span className="font-medium text-foreground" id={`${id}-label`}>
					{EvidenceLogNotice.label}
				</span>
				<span className="text-muted-foreground" id={`${id}-description`}>
					{EvidenceLogNotice.description}
				</span>
			</span>
		</label>
	);
}
