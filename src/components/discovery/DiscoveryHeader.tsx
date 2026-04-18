interface DiscoveryHeaderProps {
  personaLabel: string;
  capitalBandLabel: string;
  accentColor: string;
}

export default function DiscoveryHeader({
  personaLabel,
  capitalBandLabel,
  accentColor,
}: DiscoveryHeaderProps) {
  return (
    <div
      style={{
        padding: '20px 24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
        }}
      >
        VIEWING AS
      </p>
      <p
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: accentColor,
          marginBottom: '8px',
        }}
      >
        {personaLabel} · {capitalBandLabel}
      </p>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        All themes and instruments are shown. Your profile shapes where to start.
      </p>
    </div>
  );
}
