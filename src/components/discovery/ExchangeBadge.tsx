import type { ExchangeId } from '../../data/discovery';

const exchangeColors: Record<ExchangeId, string> = {
  ASX: '#f59e0b',
  NZX: '#10b981',
  NYSE: '#6366f1',
  LSE: '#8b5cf6',
  CRYPTO: '#06b6d4',
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
