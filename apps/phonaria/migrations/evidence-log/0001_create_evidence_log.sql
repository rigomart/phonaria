-- Opt-in scoring evidence from minimal-pair practice (#336), in its own Turso
-- database. One row per attempt. No audio, account, IP or user agent.
-- Rows are deleted once `attempted_at` is 90 days old by the Worker's daily
-- Cron Trigger (`pruneEvidenceLog` in src/server/evidence-log.ts).
CREATE TABLE IF NOT EXISTS evidence_log (
	id INTEGER PRIMARY KEY,
	schema_version INTEGER NOT NULL,
	-- Unix milliseconds.
	attempted_at INTEGER NOT NULL,
	word TEXT NOT NULL,
	target_accent TEXT NOT NULL,
	-- JSON: RecordingEvidence from @phonaria/pronunciation.
	evidence TEXT NOT NULL,
	-- JSON: { judgedPhonemeIds, gate, judgement }.
	verdicts TEXT NOT NULL,
	next_action TEXT NOT NULL CHECK (next_action IN ('retried', 'moved-on'))
);

CREATE INDEX IF NOT EXISTS evidence_log_attempted_at ON evidence_log (attempted_at);
