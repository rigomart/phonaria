// Prototype: picks a logo direction from `?logo=<id>` on page load and keeps it
// for the tab's session, so the header, footer and favicon all show the same one.
import { useEffect, useState } from "react";
import { CURRENT_LOGO_ID, getLogoVariant, type LogoVariant } from "@/components/logo-variants";

const STORAGE_KEY = "phonaria:logo-variant";

function readChosenId(): string | null {
	const fromUrl = new URLSearchParams(window.location.search).get("logo");
	if (fromUrl === CURRENT_LOGO_ID) {
		sessionStorage.removeItem(STORAGE_KEY);
		return CURRENT_LOGO_ID;
	}
	if (fromUrl && getLogoVariant(fromUrl)) {
		sessionStorage.setItem(STORAGE_KEY, fromUrl);
		return fromUrl;
	}
	return sessionStorage.getItem(STORAGE_KEY);
}

export function useLogoVariant(): { chosen: boolean; variant: LogoVariant | undefined } {
	const [chosenId, setChosenId] = useState<string | null>(null);

	useEffect(() => {
		setChosenId(readChosenId());
	}, []);

	const variant = getLogoVariant(chosenId);

	useEffect(() => {
		if (!variant) return;
		const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (!icon) return;
		const original = icon.href;
		icon.href = `/logo-variants/${variant.id}-favicon.svg`;
		return () => {
			icon.href = original;
		};
	}, [variant]);

	return { chosen: chosenId !== null, variant };
}
