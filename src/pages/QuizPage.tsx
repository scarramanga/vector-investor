import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { calculateProfile } from '../data/scoring';
import type { Answer, Option } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import ProgressBar from '../components/quiz/ProgressBar';
import QuestionCard from '../components/quiz/QuestionCard';

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | null)[]>(
    new Array(questions.length).fill(null)
  );

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const selectedLetter = currentAnswer?.selectedLetter ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(letter: Option['letter']) {
    const option = currentQuestion.options.find((o) => o.letter === letter);
    if (!option) return;

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedLetter: letter,
      personaSignal: option.personaSignal,
      capitalSignal: option.capitalSignal,
    };

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });
  }

  function handleContinue() {
    if (!selectedLetter) return;

    if (isLast) {
      const validAnswers = answers.filter((a): a is Answer => a !== null);
      const profile = calculateProfile(validAnswers);
      navigate('/result', { state: { profile } });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
    }
  }

  return (
    <PageWrapper>
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <QuestionCard
        question={currentQuestion}
        selectedLetter={selectedLetter}
        onSelect={handleSelect}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: isFirst ? 'flex-end' : 'space-between',
          marginTop: '2rem',
          gap: '1rem',
        }}
      >
        {!isFirst && (
          <button
            onClick={handleBack}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent',
              border: `1px solid var(--color-border)`,
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
            ← Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedLetter}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: selectedLetter
              ? 'var(--color-primary)'
              : 'var(--color-border)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: selectedLetter ? 'pointer' : 'not-allowed',
            opacity: selectedLetter ? 1 : 0.5,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (selectedLetter) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLetter) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {isLast ? 'See Results' : 'Continue →'}
        </button>
      </div>
    </PageWrapper>
  );
}
