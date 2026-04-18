import type { OrientationPoint } from '../../data/profiles';

interface OrientationCardProps {
  points: OrientationPoint[];
  accentColor: string;
  animationDelay: number;
}

export default function OrientationCard({
  points,
  accentColor,
  animationDelay,
}: OrientationCardProps) {
  return (
    <div
      style={{
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <p
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-muted)',
          marginBottom: '20px',
        }}
      >
        WHAT TO UNDERSTAND NEXT
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {points.map((point, index) => (
          <div key={index}>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                padding: '16px 0',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: accentColor,
                  lineHeight: '1.6',
                }}
              >
                {index + 1}
              </span>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: accentColor,
                    marginBottom: '6px',
                  }}
                >
                  {point.title}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {point.body}
                </p>
              </div>
            </div>
            {index < points.length - 1 && (
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--color-border)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
