import type { Option } from '../../types';

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  onSelect: (letter: Option['letter']) => void;
}

export default function OptionButton({ option, isSelected, onSelect }: OptionButtonProps) {
  return (
    <button
      onClick={() => onSelect(option.letter)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9375rem',
        lineHeight: '1.5',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--color-text-muted)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
          color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
      >
        {option.letter}
      </span>
      <span>{option.text}</span>
    </button>
  );
}
