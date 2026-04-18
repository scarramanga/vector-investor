interface CapitalBandBadgeProps {
  label: string;
  accentColor: string;
}

export default function CapitalBandBadge({ label, accentColor }: CapitalBandBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accentColor} 40%, transparent)`,
        fontSize: '11px',
        fontWeight: 600,
        color: accentColor,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}
