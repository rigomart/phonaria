import { type Formats, hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export const formats = {
	dateTime: {
		"short-date": {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
		"long-date": {
			day: "numeric",
			month: "long",
			year: "numeric",
		},
		"short-date-time": {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
		"long-date-time": {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
	},
	number: {
		precise: {
			maximumFractionDigits: 5,
		},
	},
	list: {
		enumeration: {
			style: "long",
			type: "conjunction",
		},
	},
} satisfies Formats;

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
		formats: formats,
	};
});
