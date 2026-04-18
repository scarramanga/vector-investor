interface ReframeCardProps {
  reframe: string;
  accentColor: string;
  animationDelay: number;
}

export default function ReframeCard({
  reframe,
  accentColor,
  animationDelay,
}: ReframeCardProps) {
  return (
    <div
      style={{
        paddingLeft: '20px',
        borderLeft: `2px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <p
        style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}
      >
        {reframe}
      </p>
    </div>
  );
}
