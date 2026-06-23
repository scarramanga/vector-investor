interface BridgeCardProps {
  bridgeText: string;
  firstAction: string;
  accentColor: string;
  animationDelay: number;
}

export default function BridgeCard({
  bridgeText,
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
          color: 'var(--color-text-secondary)',
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
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        Where to start: {firstAction}
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}
      >
        Your Vector profile works with StackMotive. Upload it during onboarding or in any Stack AI conversation to pick up where you left off.
      </p>
    </div>
  );
}
