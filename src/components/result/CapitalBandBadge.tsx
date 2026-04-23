interface CapitalBandBadgeProps {
  label: string;
  accentColor: string;
}

export default function CapitalBandBadge({ label, accentColor }: CapitalBandBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '14px',
        fontWeight: 600,
        color: accentColor,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}
