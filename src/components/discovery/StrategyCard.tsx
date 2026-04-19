import type { Strategy } from '../../data/strategies';

interface StrategyCardProps {
  strategy: Strategy;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        borderTop: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        borderLeft: '3px solid var(--color-text-secondary)',
        padding: '24px',
      }}
    >
      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '6px',
        }}
      >
        {strategy.name}
      </p>
      <p
        style={{
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
          marginBottom: '16px',
        }}
      >
        {strategy.oneLiner}
      </p>
      {strategy.paragraphs.map((paragraph, i) => (
        <p
          key={i}
          style={{
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.7,
            marginBottom: i < strategy.paragraphs.length - 1 ? '12px' : '16px',
          }}
        >
          {paragraph}
        </p>
      ))}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span style={{ fontWeight: 700 }}>Bucket mapping:</span>{' '}
        {strategy.bucketMapping}
      </p>
    </div>
  );
}
