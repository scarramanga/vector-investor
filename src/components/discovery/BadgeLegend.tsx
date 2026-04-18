import ExchangeBadge from './ExchangeBadge';
import VolatilityBadge from './VolatilityBadge';

export default function BadgeLegend() {
  return (
    <div
      style={{
        padding: '16px 24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Exchange row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          Exchange:
        </span>
        <ExchangeBadge exchange="ASX" />
        <ExchangeBadge exchange="NZX" />
        <ExchangeBadge exchange="NYSE" />
        <ExchangeBadge exchange="LSE" />
        <ExchangeBadge exchange="CRYPTO" />
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginLeft: '4px',
          }}
        >
          where this instrument is listed and traded
        </span>
      </div>

      {/* Volatility row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          Volatility:
        </span>
        <VolatilityBadge level="Low" />
        <VolatilityBadge level="Medium" />
        <VolatilityBadge level="High" />
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginLeft: '4px',
          }}
        >
          relative price movement compared to broad market
        </span>
      </div>
    </div>
  );
}
