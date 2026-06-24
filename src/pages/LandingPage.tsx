import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { trackQuizStarted } from '../services/analytics';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div style={{ textAlign: 'center' }}>
        {/* Eyebrow */}
        <p
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          Self-directed investors
        </p>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          You built something real.
        </h1>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '2.5rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Is it working hard enough for you?
        </h1>

        {/* Contrast block */}
        <div
          style={{
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { left: 'A risk questionnaire', right: 'routes you to a product' },
            { left: 'A managed fund statement', right: 'shows a number, not the real one' },
            { left: 'Vector', right: 'maps what you actually believe about money' },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  textAlign: 'right',
                  flex: '1 1 0',
                  minWidth: '140px',
                }}
              >
                {row.left}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                →
              </span>
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: i === 2 ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontWeight: i === 2 ? 600 : 400,
                  textAlign: 'left',
                  flex: '1 1 0',
                  minWidth: '140px',
                }}
              >
                {row.right}
              </span>
            </div>
          ))}
        </div>

        {/* Promise line */}
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 400,
            marginBottom: '0.25rem',
          }}
        >
          Thirteen questions. Five minutes. No sign-up.
        </p>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            marginBottom: '2.5rem',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          Your investor philosophy — mapped and connected to institutional-grade intelligence.
        </p>

        {/* CTA button */}
        <button
          onClick={() => { trackQuizStarted(); navigate('/quiz'); }}
          style={{
            padding: '0.875rem 2.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Map my investor profile →
        </button>

        {/* Below button */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.75rem',
          }}
        >
          Free · No sign-up · No advice
        </p>
      </div>
    </PageWrapper>
  );
}
