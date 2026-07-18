/**
 * Canonical Vector LLM model — resolved once from env, imported by every call site
 * (macroSignals, proxy/CALL_1 profile, pdfGenerator). Removes three duplicated literals.
 *
 * The platform ruling (2026-07-18) puts PROSE a user reads on Sonnet 4.6 and short
 * CLASSIFY on Haiku. Vector's user-facing prose (the quiz profile and the PDF) is on
 * Haiku today — a deliberate, documented cost decision (docs/session-4-brief.md models
 * the API cost "at Haiku pricing" and makes the model swappable via env). Whether to
 * move the prose calls to Sonnet 4.6 is the architect's call and is NOT applied here:
 * this change only consolidates the literals; the model string is unchanged.
 */
export const VECTOR_MODEL =
  process.env['VECTOR_CLAUDE_MODEL'] || 'claude-haiku-4-5-20251001';
