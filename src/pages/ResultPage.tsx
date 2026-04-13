import { useLocation, useNavigate } from 'react-router-dom';
import type { VectorProfile } from '../types';
import PageWrapper from '../components/layout/PageWrapper';

function formatPersona(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCapitalBand(band: string): string {
  return band
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = (location.state as { profile?: VectorProfile })?.profile;

  if (!profile) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            No profile data found. Please complete the quiz first.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Start Over
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Your Vector profile is ready.
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '3rem',
          }}
        >
          Here's what the quiz revealed about your investor orientation.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Persona
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}
            >
              {formatPersona(profile.persona)}
            </p>
          </div>

          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Capital Band
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-secondary)',
              }}
            >
              {formatCapitalBand(profile.capitalBand)}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-text-muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          Start Over
        </button>
      </div>
    </PageWrapper>
  );
}
