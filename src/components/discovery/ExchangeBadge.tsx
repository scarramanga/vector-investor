import type { ExchangeId } from '../../data/discovery';

const exchangeColors: Record<ExchangeId, string> = {
  ASX: 'var(--color-exchange-asx)',
  NZX: 'var(--color-exchange-nzx)',
  NYSE: 'var(--color-exchange-nyse)',
  LSE: 'var(--color-exchange-lse)',
  CRYPTO: 'var(--color-exchange-crypto)',
};

interface ExchangeBadgeProps {
  exchange: ExchangeId;
}

export default function ExchangeBadge({ exchange }: ExchangeBadgeProps) {
  const color = exchangeColors[exchange];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
        fontSize: '10px',
        fontWeight: 600,
        color,
        letterSpacing: '0.02em',
      }}
    >
      {exchange}
    </span>
  );
}
