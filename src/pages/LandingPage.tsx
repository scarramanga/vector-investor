import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Conviction to Clarity
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--color-primary)',
            fontWeight: 500,
            marginBottom: '2rem',
          }}
        >
          Vector by Sovereign Signal
        </p>
        <p
          style={{
            fontSize: '1.0625rem',
            lineHeight: '1.7',
            color: 'var(--color-text-secondary)',
            marginBottom: '3rem',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Thirteen questions. Your investor profile. A framework that fits the
          world as it actually is.
        </p>
        {/* How Vector is different */}
        <div
          style={{
            maxWidth: '640px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '3rem',
            textAlign: 'left',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            How Vector is different
          </h2>
          {[
            'Most financial tools start with the same question: how much risk can you tolerate? Vector starts somewhere different. It starts with what you believe.',
            'Risk tolerance questionnaires produce a number. Vector produces a framework.',
            'Robo-advisers slot you into a pre-built portfolio. Vector connects your worldview to how you think about your money.',
            'Five minutes, no sign-up, no advice. Just clarity.',
          ].map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <button
          onClick={() => navigate('/quiz')}
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
          Begin →
        </button>
      </div>
    </PageWrapper>
  );
}
