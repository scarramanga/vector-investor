import { useState } from 'react';
import type { PersonaType } from '../../types';
import { personaEducationCards, educationConcepts } from '../../data/profiles';
import { conceptExplanations } from '../../data/concepts';

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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  function toggleCard(name: string) {
    setExpandedCards((prev) => ({ ...prev, [name]: !prev[name] }));
  }

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
          const isExpanded = expandedCards[name] ?? false;
          const explanation = conceptExplanations[name]?.explanation;
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
              {isExpanded && explanation && (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '12px',
                  }}
                >
                  {explanation}
                </p>
              )}
              {explanation && (
                <button
                  onClick={() => toggleCard(name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    color: accentColor,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {isExpanded ? 'Show less \u2191' : 'Read more \u2192'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <a
          href="https://thesovsignal.substack.com/about"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            color: accentColor,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Explore these concepts on The Sovereign Signal &rarr;
        </a>
      </div>
    </div>
  );
}
