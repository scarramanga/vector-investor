import type { Instrument } from '../../data/discovery';
import ExchangeBadge from './ExchangeBadge';
import VolatilityBadge from './VolatilityBadge';
import StackMotiveHook from './StackMotiveHook';

interface InstrumentCardProps {
  instrument: Instrument;
  accentColor: string;
  themeColor: string;
  animationDelay: number;
}

export default function InstrumentCard({
  instrument,
  accentColor,
  themeColor,
  animationDelay,
}: InstrumentCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        animation: 'fadeSlideUp 0.4s ease both',
        animationDelay: `${animationDelay}ms`,
        minWidth: '260px',
      }}
    >
      {/* Top row: Ticker + badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: accentColor,
          }}
        >
          {instrument.ticker}
        </span>
        <ExchangeBadge exchange={instrument.exchange} />
        <VolatilityBadge level={instrument.volatility} />
      </div>

      {/* Name */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
          fontWeight: 500,
        }}
      >
        {instrument.name}
      </p>

      {/* Thesis */}
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          marginBottom: '12px',
        }}
      >
        {instrument.thesis}
      </p>

      {/* Access row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          Available on:
        </span>
        {instrument.access.map((method) => (
          <span
            key={method}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
            }}
          >
            {method}
          </span>
        ))}
      </div>

      {/* StackMotive hook */}
      <StackMotiveHook text={instrument.stackmotiveHook} color={themeColor} fontSize={11} />
    </div>
  );
}
