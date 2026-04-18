import type { VolatilityLevel } from '../../data/discovery';

const volatilityColors: Record<VolatilityLevel, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: 'var(--color-danger)',
};

interface VolatilityBadgeProps {
  level: VolatilityLevel;
}

export default function VolatilityBadge({ level }: VolatilityBadgeProps) {
  const color = volatilityColors[level];
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
      {level}
    </span>
  );
}
