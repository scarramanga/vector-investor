import { useState } from 'react';
import type { PersonaType } from '../../types';
import type { Theme, Instrument, ThemeId } from '../../data/discovery';
import InstrumentCard from './InstrumentCard';
import StackMotiveHook from './StackMotiveHook';

const themeColors: Record<ThemeId, string> = {
  debasement: '#10b981',
  technology: '#6366f1',
  energy: '#f59e0b',
  digital: '#06b6d4',
};

interface ThemeCardProps {
  theme: Theme;
  instruments: Instrument[];
  persona: PersonaType;
  accentColor: string;
  defaultExpanded?: boolean;
  animationDelay: number;
}

export default function ThemeCard({
  theme,
  instruments,
  persona,
  accentColor,
  defaultExpanded = false,
  animationDelay,
}: ThemeCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const themeColor = themeColors[theme.id];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${themeColor}`,
        padding: '24px',
        animation: 'fadeSlideUp 0.6s ease both',
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Theme header */}
      <p
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}
      >
        {theme.name}
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          marginBottom: '12px',
          lineHeight: 1.5,
        }}
      >
        {theme.tagline}
      </p>

      {/* Persona context */}
      <p
        style={{
          fontSize: '12px',
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          marginBottom: '16px',
          lineHeight: 1.5,
        }}
      >
        {theme.personaContext[persona]}
      </p>

      {/* StackMotive hook */}
      <div style={{ marginBottom: '16px' }}>
        <StackMotiveHook text={theme.stackmotiveHook} color={themeColor} fontSize={12} />
      </div>

      {/* Expand/collapse toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
          color: themeColor,
          padding: '4px 0',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {expanded ? 'Hide instruments ↑' : 'Show instruments ↓'}
      </button>

      {/* Instrument cards */}
      {expanded && (
        <div
          className="instrument-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {instruments.map((instrument, i) => (
            <InstrumentCard
              key={instrument.ticker}
              instrument={instrument}
              accentColor={accentColor}
              themeColor={themeColor}
              animationDelay={i * 75}
            />
          ))}
        </div>
      )}
    </div>
  );
}
