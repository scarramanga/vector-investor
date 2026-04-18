interface SkeletonCardProps {
  accentColor: string;
  animationDelay: number;
}

export default function SkeletonCard({
  accentColor,
  animationDelay,
}: SkeletonCardProps) {
  return (
    <div
      style={{
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Recognition skeleton block */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          borderLeft: `3px solid ${accentColor}`,
          opacity: 0.6,
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '10px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '92%',
              height: '14px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '85%',
              height: '14px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '60%',
              height: '14px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Reframe skeleton block */}
      <div
        style={{
          paddingLeft: '20px',
          borderLeft: `2px solid var(--color-border)`,
          opacity: 0.6,
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
          animationDelay: '0.3s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '13px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '88%',
              height: '13px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '70%',
              height: '13px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Loading text */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          animation: 'skeletonPulse 1.5s ease-in-out infinite',
        }}
      >
        Building your profile...
      </p>
    </div>
  );
}
