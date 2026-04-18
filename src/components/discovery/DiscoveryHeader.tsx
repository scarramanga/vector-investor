export default function DiscoveryHeader() {
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
        INSTRUMENT REFERENCE GUIDE
      </p>
      <p
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginBottom: '8px',
        }}
      >
        Themes, Buckets and Instruments
      </p>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        A reference library of investment themes and the instruments commonly associated with them.
      </p>
    </div>
  );
}
