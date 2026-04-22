interface BridgeCardProps {
  bridgeText: string;
  bridgeCTA: string;
  firstAction: string;
  accentColor: string;
  animationDelay: number;
}

export default function BridgeCard({
  bridgeText,
  bridgeCTA,
  firstAction,
  accentColor,
  animationDelay,
}: BridgeCardProps) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, var(--color-surface) 0%, color-mix(in srgb, ${accentColor} 5%, var(--color-surface)) 100%)`,
        border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)`,
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <p
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
        }}
      >
        YOUR NEXT STEP
      </p>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
          marginBottom: '16px',
        }}
      >
        {bridgeText}
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        Where to start: {firstAction}
      </p>
      <div
        className="bridge-cta-row"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <a
          href="https://www.stackmotiveapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bridge-cta-button"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {bridgeCTA}
        </a>
        <a
          href="https://thesovsignal.substack.com/about"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
          }}
        >
          Learn more about The Sovereign Signal →
        </a>
      </div>
    </div>
  );
}
