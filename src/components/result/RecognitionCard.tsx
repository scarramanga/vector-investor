interface RecognitionCardProps {
  recognition: string;
  accentColor: string;
  animationDelay: number;
}

export default function RecognitionCard({
  recognition,
  accentColor,
  animationDelay,
}: RecognitionCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        borderLeft: `3px solid ${accentColor}`,
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
        WHO YOU ARE
      </p>
      <p
        style={{
          fontSize: '16px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
        }}
      >
        {recognition}
      </p>
    </div>
  );
}
