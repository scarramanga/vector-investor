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
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-primary)',
          marginBottom: '8px',
        }}
      >
        Themes, Buckets and Instruments
      </p>
      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
        }}
      >
        INSTRUMENT REFERENCE GUIDE
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
