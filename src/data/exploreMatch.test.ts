// GAP-267 Phase 2 (Part 6): the explore matcher only surfaces themes that trace
// to a stated belief/interest phrase; nothing generic, and empty when nothing fits.

import { describe, expect, it } from 'vitest';
import { matchExploreThemes } from './exploreMatch';
import type { Belief } from '../types/v2';

const belief = (theme: string): Belief => ({ theme, status: 'considering', evidence: [] });
const interest = (theme: string): Belief => ({ theme, status: 'learning-interest', evidence: [] });

describe('matchExploreThemes', () => {
  it('connects a structural-change belief to the technology theme', () => {
    const m = matchExploreThemes([belief('exposure to structural change')]);
    expect(m.map((x) => x.theme.id)).toContain('technology');
    // every surfaced theme carries an illustrative instrument where one exists
    expect(m.every((x) => x.example === null || x.example.themes.includes(x.theme.id))).toBe(true);
  });

  it('connects capital-preservation / managing-risk to monetary debasement', () => {
    expect(matchExploreThemes([belief('preserving capital for its intended use')]).map((x) => x.theme.id)).toContain('debasement');
    expect(matchExploreThemes([interest('managing risk')]).map((x) => x.theme.id)).toContain('debasement');
  });

  it('returns nothing for purely foundational interests (caller shows a broad-start note)', () => {
    const m = matchExploreThemes([interest('how markets work'), interest('diversification and index funds')]);
    expect(m).toHaveLength(0);
  });

  it('returns nothing when there are no beliefs at all', () => {
    expect(matchExploreThemes([])).toHaveLength(0);
  });

  it('caps at three themes', () => {
    const m = matchExploreThemes([
      belief('exposure to structural change'),
      interest('long-term themes'),
      interest('managing risk'),
      belief('digital assets and blockchain'),
    ]);
    expect(m.length).toBeLessThanOrEqual(3);
  });
});
