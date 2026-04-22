import type { PersonaType } from '../../types';
import { personaEducationCards, educationConcepts, conceptLinks } from '../../data/profiles';

interface EducationCardsProps {
  persona: PersonaType;
  accentColor: string;
  animationDelay: number;
}

export default function EducationCards({
  persona,
  accentColor,
  animationDelay,
}: EducationCardsProps) {
  const conceptNames = personaEducationCards[persona];

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
          marginBottom: '16px',
        }}
      >
        CONCEPTS WORTH UNDERSTANDING
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {conceptNames.map((name) => {
          const concept = educationConcepts[name];
          if (!concept) return null;
          return (
            <div
              key={name}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                }}
              >
                {concept.name}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '12px',
                }}
              >
                {concept.description}
              </p>
              <a
                href={conceptLinks[name] || 'https://thesovsignal.substack.com/about'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  color: accentColor,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Learn more →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
