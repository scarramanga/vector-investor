import { getBrokerRecommendation } from '../../data/brokerMatrix';

interface BrokerRecommendationProps {
  country: string;
  capitalBand: string;
  philosophy?: string | null;
  animationDelay: number;
}

export default function BrokerRecommendation({
  country,
  capitalBand,
  philosophy,
  animationDelay,
}: BrokerRecommendationProps) {
  const rec = getBrokerRecommendation(country, capitalBand, philosophy);

  return (
    <div
      style={{
        animation: 'fadeSlideUp 0.6s ease both',
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        A note on where to hold your assets
      </p>

      {/* Primary broker */}
      <div style={{ marginBottom: rec.secondary ? '24px' : '20px' }}>
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--color-text-secondary)',
            marginBottom: '6px',
          }}
        >
          PRIMARY
        </p>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}
        >
          {rec.primary.name}
        </p>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            lineHeight: 1.7,
          }}
        >
          {rec.primary.description}
        </p>
        {rec.philosophyOverlay && (
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
              marginTop: '12px',
            }}
          >
            {rec.philosophyOverlay}
          </p>
        )}
      </div>

      {/* Secondary broker */}
      {rec.secondary && (
        <div style={{ marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              color: 'var(--color-text-secondary)',
              marginBottom: '6px',
            }}
          >
            SECONDARY
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}
          >
            {rec.secondary.name}
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
            }}
          >
            {rec.secondary.description}
          </p>
        </div>
      )}

      {/* Compliance footer */}
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        This is not financial advice. We have no financial relationship with any broker listed. These
        characteristics are provided for information only. Research each platform independently before
        making a decision.
      </p>
    </div>
  );
}
