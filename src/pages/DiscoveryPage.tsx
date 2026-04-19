import { useLayoutEffect } from 'react';
import {
  buckets,
  themes,
  instruments,
} from '../data/discovery';
import { strategies } from '../data/strategies';
import DiscoveryHeader from '../components/discovery/DiscoveryHeader';
import BucketCard from '../components/discovery/BucketCard';
import ThemeCard from '../components/discovery/ThemeCard';
import BadgeLegend from '../components/discovery/BadgeLegend';
import StrategyCard from '../components/discovery/StrategyCard';

const bucketEnrichment: Record<string, { allocationRange: string; instrumentCategories: string }> = {
  foundation: {
    allocationRange: 'Typical range: 30\u201360% of a portfolio',
    instrumentCategories: 'Gold ETFs, inflation-linked bonds, cash equivalents, stablecoins (as cash management)',
  },
  growth: {
    allocationRange: 'Typical range: 30\u201350% of a portfolio',
    instrumentCategories: 'International equity ETFs, quality domestic equities, infrastructure funds',
  },
  conviction: {
    allocationRange: 'Typical range: 5\u201320% of a portfolio',
    instrumentCategories: 'Gold miners, technology equities, energy equities, digital assets, thematic ETFs',
  },
};

export default function DiscoveryPage() {
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

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
        <DiscoveryHeader />

        {/* Framing statement */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          The following is a reference guide to investment themes and the instruments commonly
          associated with them. This content is the same for every user. It is not based on your
          quiz answers and is not a recommendation. These are the building blocks that informed
          investors use when constructing portfolios. If you want to research any of these
          instruments further, StackMotive shows you what institutional money is doing in each
          space.
        </p>

        {/* Badge legend */}
        <BadgeLegend />

        {/* Bucket allocation context */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Portfolio strategists generally work within these ranges, adjusted for time horizon
          and risk tolerance. These are industry norms, not recommendations.
        </p>

        {/* Bucket cards */}
        <div
          className="bucket-row"
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {buckets.map((bucket) => {
            const enrichment = bucketEnrichment[bucket.id];
            return (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                allocationRange={enrichment.allocationRange}
                instrumentCategories={enrichment.instrumentCategories}
              />
            );
          })}
        </div>

        {/* Crypto colour note */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
            }}
          >
            Digital assets (shown in cyan) appear across buckets rather than in a dedicated
            category. Bitcoin, for example, functions as a Foundation asset (store of value,
            fixed supply) and a Conviction asset (digital infrastructure thesis) simultaneously.
            This dual nature is a feature of the asset class, not an omission in the framework.
          </p>
        </div>

        {/* Strategy education section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            How investors structure these ideas
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
            }}
          >
            There is no single correct way to build a portfolio. But there are well-established
            frameworks that investors have used for decades to translate conviction into structure.
            The following five strategies are among the most widely taught and practised. None is
            a recommendation. Each represents a different philosophy about how to balance risk,
            conviction, and diversification.
          </p>
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>

        {/* Theme cards */}
        {themes.map((theme, i) => {
          const themeInstruments = instruments.filter((inst) =>
            inst.themes.includes(theme.id)
          );
          return (
            <ThemeCard
              key={theme.id}
              theme={theme}
              instruments={themeInstruments}
              accentColor='var(--color-primary)'
              defaultExpanded={false}
              animationDelay={i * 100}
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
