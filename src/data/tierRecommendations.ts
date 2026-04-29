import type { PersonaType, CapitalBand } from '../types';

export interface TierRecommendation {
  tierName: string;
  description: string;
}

/**
 * Tier recommendation mapping based on persona and capital band.
 *
 * Brief mapping (translated to codebase capital band values):
 *   Emerging / Growing  → emerging, building
 *   Established / Affluent / HNW / Sovereign Concentrated →
 *     established, concentrated, sovereign-capital, sovereign-concentrated
 */
const tierMap: Record<PersonaType, Record<CapitalBand, TierRecommendation>> = {
  'awakening': {
    'emerging': { tierName: 'Observer', description: 'Observer — start free, tour Navigator' },
    'building': { tierName: 'Observer', description: 'Observer — start free, tour Navigator' },
    'established': { tierName: 'Navigator', description: 'Navigator' },
    'concentrated': { tierName: 'Navigator', description: 'Navigator' },
    'sovereign-capital': { tierName: 'Navigator', description: 'Navigator' },
    'sovereign-concentrated': { tierName: 'Navigator', description: 'Navigator' },
  },
  'gut-trader': {
    'emerging': { tierName: 'Navigator', description: 'Navigator' },
    'building': { tierName: 'Navigator', description: 'Navigator' },
    'established': { tierName: 'Operator', description: 'Operator' },
    'concentrated': { tierName: 'Operator', description: 'Operator' },
    'sovereign-capital': { tierName: 'Operator', description: 'Operator' },
    'sovereign-concentrated': { tierName: 'Operator', description: 'Operator' },
  },
  'swamped-analyst': {
    'emerging': { tierName: 'Navigator', description: 'Navigator' },
    'building': { tierName: 'Navigator', description: 'Navigator' },
    'established': { tierName: 'Operator', description: 'Operator' },
    'concentrated': { tierName: 'Operator', description: 'Operator' },
    'sovereign-capital': { tierName: 'Operator', description: 'Operator' },
    'sovereign-concentrated': { tierName: 'Operator', description: 'Operator' },
  },
  'comfortable-blind-spot': {
    'emerging': { tierName: 'Navigator', description: 'Navigator' },
    'building': { tierName: 'Navigator', description: 'Navigator' },
    'established': { tierName: 'Navigator', description: 'Navigator' },
    'concentrated': { tierName: 'Navigator', description: 'Navigator' },
    'sovereign-capital': { tierName: 'Navigator', description: 'Navigator' },
    'sovereign-concentrated': { tierName: 'Operator', description: 'Operator' },
  },
};

export function getTierRecommendation(persona: PersonaType, capitalBand: CapitalBand): TierRecommendation {
  return tierMap[persona][capitalBand];
}
