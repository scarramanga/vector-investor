interface ProfileHeaderProps {
  headline: string;
  accentColor: string;
  animationDelay: number;
}

export default function ProfileHeader({
  headline,
  accentColor,
  animationDelay,
}: ProfileHeaderProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        paddingTop: '24px',
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <p
        className="vector-profile-heading"
        style={{
          fontSize: '28px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
        }}
      >
        YOUR VECTOR PROFILE
      </p>
      <div
        style={{
          width: '3px',
          height: '48px',
          backgroundColor: accentColor,
          borderRadius: 'var(--radius-full)',
          margin: '0 auto 24px',
        }}
      />
      <h1
        className="profile-headline"
        style={{
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
          marginBottom: '20px',
        }}
      >
        {headline}
      </h1>
    </div>
  );
}
