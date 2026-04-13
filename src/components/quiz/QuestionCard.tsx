import type { Question, Option } from '../../types';
import OptionButton from './OptionButton';

interface QuestionCardProps {
  question: Question;
  selectedLetter: Option['letter'] | null;
  onSelect: (letter: Option['letter']) => void;
}

export default function QuestionCard({ question, selectedLetter, onSelect }: QuestionCardProps) {
  return (
    <div>
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: '1.6',
          color: 'var(--color-text-primary)',
          marginBottom: '1.5rem',
        }}
      >
        {question.text}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {question.options.map((option) => (
          <OptionButton
            key={option.letter}
            option={option}
            isSelected={selectedLetter === option.letter}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
