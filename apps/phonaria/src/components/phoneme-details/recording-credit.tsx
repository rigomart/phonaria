import { getPhonemeRecordingSource, type PhonemeSymbolId } from "@phonaria/phonetics-data";

const linkClass = "underline underline-offset-2 hover:text-foreground";

/** Who made the sound's recording and its license, linked to its file on Wikimedia Commons. */
export function RecordingCredit({ phonemeId }: { phonemeId: PhonemeSymbolId }) {
	const source = getPhonemeRecordingSource(phonemeId);
	if (!source) return null;
	const { license } = source;

	return (
		<p className="text-xs text-muted-foreground">
			Recording:{" "}
			<a href={source.pageUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
				{source.authors.join(", ")}
			</a>
			{", "}
			{license.url ? (
				<a href={license.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
					{license.name}
				</a>
			) : (
				license.name
			)}
		</p>
	);
}
