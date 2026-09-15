// GAP-267 Phase 2 (Part 6) - a personalised "explore next" section on the v2
// result page. Observation-only: it surfaces discovery themes that connect to
// what the user told us (declared beliefs or learning interests), each with one
// illustrative instrument. Never a recommendation, never an allocation.

import type { V2Profile } from '../../types/v2';
import { matchExploreThemes } from '../../data/exploreMatch';

export default function ExploreSection({ profile }: { profile: V2Profile }) {
  const matches = matchExploreThemes(profile.beliefs);
  const isLearning = profile.route === 'learning' || profile.route === 'developing';

  const intro = matches.length
    ? isLearning
      ? 'Based on what you said you want to learn about, these are themes worth exploring as you go:'
      : 'The approach you described connects to these themes:'
    : 'A broad, diversified foundation is where most investors start. When you are ready, StackMotive lets you explore these themes and see what institutional money is doing in each.';

  return (
    <div style={{ marginTop: 24, padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>Where you might explore next</strong>
      <p style={{ margin: '6px 0 12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{intro}</p>

      {matches.map(({ theme, example }) => (
        <div key={theme.id} style={{ padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{theme.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{theme.tagline}</div>
          {example ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              For example: {example.name} ({example.ticker}, {example.exchange}) - shown to illustrate the theme, not as a recommendation.
            </div>
          ) : null}
        </div>
      ))}

      <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        These are examples to explore and learn from, never recommendations to buy or sell. Research anything here independently first.
      </p>
    </div>
  );
}
