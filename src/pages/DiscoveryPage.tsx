import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VectorProfile } from '../types';
import type { VectorAnswerPayload } from '../types/vector';
import { profiles, capitalBandLabels } from '../data/profiles';
import { buildAnswerPayload } from '../data/scoring';
import {
  buckets,
  themes,
  instruments,
  allocationSuggestions,
  getAllocationKey,
} from '../data/discovery';
import DiscoveryHeader from '../components/discovery/DiscoveryHeader';
import AllocationBar from '../components/discovery/AllocationBar';
import BucketCard from '../components/discovery/BucketCard';
import ThemeCard from '../components/discovery/ThemeCard';
import BadgeLegend from '../components/discovery/BadgeLegend';

function formatPersonaLabel(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function DiscoveryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { profile?: VectorProfile; answerPayload?: VectorAnswerPayload } | null;
  const vectorProfile = state?.profile;
  const answerPayload = state?.answerPayload ?? (vectorProfile ? buildAnswerPayload(vectorProfile) : null);

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  if (!vectorProfile) {
    navigate('/', { replace: true });
    return null;
  }

  const profileContent = profiles[vectorProfile.persona];
  const bandLabel = capitalBandLabels[vectorProfile.capitalBand];
  const personaLabel = formatPersonaLabel(vectorProfile.persona);
  const allocationKey = getAllocationKey(vectorProfile.persona, vectorProfile.capitalBand);
  const allocation = allocationSuggestions[allocationKey];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh',
      }}
    >
      <div
        className="discovery-container"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Section 1 — DiscoveryHeader */}
        <DiscoveryHeader
          personaLabel={personaLabel}
          capitalBandLabel={bandLabel}
          accentColor={profileContent.accentColor}
        />

        {/* Badge legend */}
        <BadgeLegend />

        {/* Section 2 — AllocationBar */}
        {allocation && <AllocationBar allocation={allocation} />}

        {/* Section 3 — Bucket cards */}
        <div
          className="bucket-row"
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {buckets.map((bucket) => {
            const percentage = allocation
              ? allocation[bucket.id]
              : 0;
            return (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                percentage={percentage}
              />
            );
          })}
        </div>

        {/* Section 4 — Theme cards */}
        {themes.map((theme, i) => {
          const themeInstruments = instruments.filter((inst) =>
            inst.themes.includes(theme.id)
          );
          return (
            <ThemeCard
              key={theme.id}
              theme={theme}
              instruments={themeInstruments}
              persona={vectorProfile.persona}
              accentColor={profileContent.accentColor}
              defaultExpanded={false}
              animationDelay={i * 100}
              answerPayload={answerPayload}
            />
          );
        })}

        {/* Section 5 — Disclaimer footer */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '32px',
            maxWidth: '560px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            Vector is an educational and orientation tool. Nothing on this page constitutes
            financial advice or a recommendation to buy or sell any security. All instruments
            shown are for research purposes only. Past performance is not indicative of future
            results. Always consider your own financial situation or seek professional advice
            before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
