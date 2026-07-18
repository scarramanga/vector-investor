/**
 * Canonical Vector LLM model. All three Vector prompts write PROSE A USER READS —
 * the quiz profile (proxy/CALL_1, the first prose a stranger reads), the PDF Investor
 * Profile Report (pdfGenerator), and the macro signal block rendered into the
 * follow-up emails (macroSignals -> followupJob -> followupEmails). Per the platform
 * ruling (Andy, 2026-07-18) prose runs on Sonnet 4.6.
 *
 * There is no CLASSIFY tier in Vector: nothing here does short structured
 * classification, so no Haiku constant is defined.
 *
 * Override: the existing VECTOR_CLAUDE_MODEL env var is kept as the swap knob (not
 * renamed). NOTE: production currently sets it to "claude-haiku-4-5-20251001"
 * (vector-secrets), which OVERRIDES the Sonnet default below and holds prose on Haiku.
 * For the ruling to take effect, that secret must be updated to claude-sonnet-4-6 or
 * removed — see the PR. This constant changes the default; the deployment change
 * delivers it.
 */
export const PROSE_MODEL =
  process.env['VECTOR_CLAUDE_MODEL'] || 'claude-sonnet-4-6';
