/**
 * Recommended-tier derivation shared across server modules.
 *
 * Derives the recommended tier from persona + capital band using the same
 * mapping as the frontend tierRecommendations.ts. Extracted so both the
 * follow-up CronJob and the Vector routes can reuse it without importing the
 * CronJob entry module (which runs main() at import time).
 */
export function getRecommendedTier(persona: string, capitalBand: string): string {
  const tierMap: Record<string, Record<string, string>> = {
    'awakening': {
      'emerging': 'Observer',
      'building': 'Observer',
      'established': 'Navigator',
      'concentrated': 'Navigator',
      'sovereign-capital': 'Navigator',
      'sovereign-concentrated': 'Navigator',
    },
    'gut-trader': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Operator',
      'concentrated': 'Operator',
      'sovereign-capital': 'Operator',
      'sovereign-concentrated': 'Operator',
    },
    'swamped-analyst': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Operator',
      'concentrated': 'Operator',
      'sovereign-capital': 'Operator',
      'sovereign-concentrated': 'Operator',
    },
    'comfortable-blind-spot': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Navigator',
      'concentrated': 'Navigator',
      'sovereign-capital': 'Navigator',
      'sovereign-concentrated': 'Operator',
    },
  };

  return tierMap[persona]?.[capitalBand] || 'Observer';
}
