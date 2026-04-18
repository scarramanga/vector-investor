interface ReframeCardProps {
  reframe: string;
  dynamicContent?: string | null;
  accentColor: string;
  animationDelay: number;
}

export default function ReframeCard({
  reframe,
  dynamicContent,
  accentColor,
  animationDelay,
}: ReframeCardProps) {
  const displayText = dynamicContent || reframe;

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
        {displayText}
      </p>
    </div>
  );
}
