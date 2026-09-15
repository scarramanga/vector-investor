// GAP-267 Phase 2 (Part 6) - connect a v2 profile to discovery themes for the
// result-page "explore next" section. Matching is keyword-based against the
// user's own stated belief/interest phrases, so every theme shown traces to
// something they actually said. No match -> the caller shows a broad-start note.

import { themes, instruments, type Theme, type Instrument, type ThemeId } from './discovery';
import type { Belief } from '../types/v2';

// A theme surfaces if any keyword appears in any stated belief/interest phrase
// (case-insensitive substring). Kept deliberately conservative to avoid
// over-matching a broad statement to a specific theme.
const THEME_KEYWORDS: Record<ThemeId, string[]> = {
  debasement: ['preserv', 'hard asset', 'gold', 'inflation', 'debasement', 'macro', 'managing risk', 'protect'],
  technology: ['structural change', 'technolog', 'innovation', 'disrupt', 'long-term theme', 'analyse a company'],
  energy: ['energy', 'scarcity', 'commodit', 'resource', 'long-term theme'],
  digital: ['digital', 'bitcoin', 'crypto', 'blockchain', 'structural change'],
};

export interface ExploreMatch {
  theme: Theme;
  example: Instrument | null;
}

/**
 * Up to three discovery themes that connect to the user's stated beliefs /
 * learning interests, each with one illustrative instrument. Empty when nothing
 * matches (the caller falls back to a broad-start note).
 */
export function matchExploreThemes(beliefs: Belief[]): ExploreMatch[] {
  const signals = beliefs.map((b) => (b.theme || '').toLowerCase()).filter(Boolean);
  if (signals.length === 0) return [];

  const matched: ExploreMatch[] = [];
  for (const theme of themes) {
    const kws = THEME_KEYWORDS[theme.id];
    const hit = signals.some((s) => kws.some((k) => s.includes(k)));
    if (hit) {
      matched.push({ theme, example: instruments.find((i) => i.themes.includes(theme.id)) ?? null });
      if (matched.length >= 3) break;
    }
  }
  return matched;
}
