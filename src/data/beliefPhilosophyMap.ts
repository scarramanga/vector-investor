// GAP-267 Phase 1 - map a v2 explicit-belief option to a StackMotive canonical
// philosophy name (the vocabulary vector_philosophy_themes + Foundry understand).
// Only a mapped, CONFIRMED belief becomes a declared theme. Unmapped beliefs
// (e.g. broad-market participation, for which the current canonical taxonomy has
// no clean equivalent, or free-text "other") return null and are NOT declared -
// they stay as exploratory interests instead. Never invent a philosophy.

export type CanonicalPhilosophy =
  | 'Value and Patience'
  | 'Disruptive Growth'
  | 'Rules-Based Systematic'
  | 'Capital Preservation'
  | 'Macro and Hard Assets';

const BELIEF_TO_PHILOSOPHY: Record<string, CanonicalPhilosophy> = {
  'below-value': 'Value and Patience',
  'structural-change': 'Disruptive Growth',
  'consistent-rules': 'Rules-Based Systematic',
  'capital-preservation': 'Capital Preservation',
  // 'growth-participation' (broad market) and 'other' intentionally omitted:
  // no clean canonical philosophy - they remain exploratory, never declared.
};

export function beliefToCanonicalPhilosophy(beliefOptionId: string | undefined): CanonicalPhilosophy | null {
  if (!beliefOptionId) return null;
  return BELIEF_TO_PHILOSOPHY[beliefOptionId] ?? null;
}
