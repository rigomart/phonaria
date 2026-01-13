import { routing } from "@/i18n/routing";

export const SITE_NAME = "Phonaria";

const siteUrl = process.env.SITE_URL;

if (!siteUrl && process.env.NODE_ENV === "production") {
	console.warn("SITE_URL environment variable is not set. Canonical URLs will be incorrect.");
}

export const SITE_URL = siteUrl ?? "http://localhost:3000";

const normalizePath = (path?: string) => {
	if (!path || path === "/") {
		return "";
	}

	return path.startsWith("/") ? path : `/${path}`;
};

export const getLocalePath = (locale: string, path?: string) => {
	return `/${locale}${normalizePath(path)}`;
};

export const getLanguageAlternates = (path?: string) => {
	return routing.locales.reduce<Record<string, string>>((acc, locale) => {
		acc[locale] = getLocalePath(locale, path);
		return acc;
	}, {});
};
