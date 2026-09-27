// GAP-267 Phase 1 - the v2 adaptive questionnaire flow. Rendered alongside the
// live v1 QuizPage; routed at /quiz-v2 until cutover. Honest progress from the
// first step, back navigation, answer changes, session persistence, and
// step-distinguished analytics that never carry answer content.
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { QUESTIONS_V2, ROUTE_QUESTION } from '../data/questionsV2';
import type { AnsweredBy, RouteId, V2Answer, V2Question } from '../types/v2';
import {
  clearSession,
  loadSession,
  saveSession,
  upsertAnswer,
  type QuizSessionV2,
} from '../services/quizSessionV2';
import { trackV2 } from '../services/analyticsV2';
import { answersFromPreload, loadPreload, type ChatPreload } from '../services/chatPreload';

function visibleQuestions(route: RouteId | null): V2Question[] {
  if (!route) return [];
  return QUESTIONS_V2.filter((q) => {
    if (q.skipWhenRouteEstablishes && (route === 'learning' || route === 'adviser-led')) return false;
    if (q.showForRoutes && !q.showForRoutes.includes(route)) return false;
    return true;
  });
}

// Stack AI page (Ripen spec, Build 2): a Vector door arrives with a pre-load,
// the prospect's belief and sell rule in their own words. Those answers are in
// place before the first question, and the first step shows them so the person
// sees their words waiting rather than being asked again. Router state wins;
// sessionStorage covers a refresh.
function preloadedSession(preload: ChatPreload | null, now: number): QuizSessionV2 {
  const base = loadSession(now);
  if (!preload) return base;
  const given = answersFromPreload(preload);
  // the route question, pre-answered from the conversation when the engine
  // could judge it in their words; a route already chosen here is kept
  const route = base.route ?? preload.vectorRoute ?? null;
  if (given.length === 0 && route === base.route) return base;
  const alreadyIn = given.every((g) => base.answers.some((a) => a.questionId === g.questionId && a.text === g.text));
  if (alreadyIn && route === base.route) return base;
  let answers = base.answers;
  for (const g of given) answers = upsertAnswer(answers, g);
  return { ...base, answers, route };
}

export default function QuizPageV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preload] = useState<ChatPreload | null>(() => {
    const fromState = (location.state as { preload?: ChatPreload } | null)?.preload;
    return fromState ?? loadPreload();
  });
  const [session, setSession] = useState<QuizSessionV2>(() => preloadedSession(preload, Date.now()));

  useEffect(() => {
    trackV2.quizArrived();
  }, []);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const questions = useMemo(() => visibleQuestions(session.route), [session.route]);
  // Step 0 is always the routing question; the rest follow once a route is chosen.
  const totalSteps = 1 + questions.length;
  const index = session.route ? session.index : 0;
  const onRoute = index === 0;
  const question: V2Question | null = onRoute ? null : questions[index - 1];

  const answersById = useMemo(() => {
    const m = new Map<string, V2Answer>();
    for (const a of session.answers) m.set(a.questionId, a);
    return m;
  }, [session.answers]);

  const routeChosen = session.route;
  const currentAnswer = question ? answersById.get(question.id) : undefined;
  const answeredCount = (routeChosen ? 1 : 0) + questions.filter((q) => answersById.has(q.id)).length;
  const percent = Math.round((answeredCount / totalSteps) * 100);

  function chooseRoute(route: RouteId) {
    setSession((s) => {
      const first = !s.startedAt;
      if (first) trackV2.firstAnswer(route);
      return { ...s, route, startedAt: s.startedAt || Date.now(), index: 0 };
    });
  }

  function toggleAnsweredBy(by: AnsweredBy) {
    setSession((s) => ({ ...s, answeredBy: by }));
  }

  function selectOption(optionId: string) {
    if (!question) return;
    const multi = question.multiSelect === true;
    setSession((s) => {
      const existing = answersById.get(question.id);
      let selected: string[];
      if (multi) {
        const cur = existing?.selectedOptionIds ?? [];
        selected = cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId];
      } else {
        selected = [optionId];
      }
      const answer: V2Answer = { questionId: question.id, selectedOptionIds: selected, text: existing?.text };
      return { ...s, answers: upsertAnswer(s.answers, answer) };
    });
  }

  function setOptionalText(text: string) {
    if (!question) return;
    setSession((s) => {
      const existing = answersById.get(question.id) ?? { questionId: question.id, selectedOptionIds: [] };
      return { ...s, answers: upsertAnswer(s.answers, { ...existing, text }) };
    });
  }

  const preloadedIds = useMemo(() => new Set(preload ? answersFromPreload(preload).map((a) => a.questionId) : []), [preload]);
  const preAnswered = question ? preloadedIds.has(question.id) && answersById.has(question.id) : false;

  const canContinue = onRoute ? Boolean(session.route) : (currentAnswer?.selectedOptionIds.length ?? 0) > 0;
  const isLast = !onRoute && index === totalSteps - 1;

  function handleContinue() {
    if (!canContinue) return;
    if (question) trackV2.stepCompleted(question.id, index);
    if (isLast) {
      navigate('/result-v2', {
        state: { route: session.route, answeredBy: session.answeredBy, answers: session.answers },
      });
      return;
    }
    setSession((s) => ({ ...s, index: s.index + 1 }));
  }

  function handleBack() {
    if (index === 0) return;
    setSession((s) => ({ ...s, index: Math.max(0, s.index - 1) }));
  }

  function handleRestart() {
    clearSession();
    // Starting over clears this questionnaire's answers; what came from the
    // conversation stays in place, because it was said there, not here.
    setSession(preloadedSession(preload, 0));
  }

  return (
    <PageWrapper>
      <div style={{ marginBottom: '1.5rem' }} aria-hidden={false}>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: step ${index + 1} of ${totalSteps}`}
          style={{ height: 6, background: 'var(--color-border)', borderRadius: 999 }}
        >
          <div style={{ width: `${percent}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 999, transition: 'width 0.2s ease' }} />
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
          Step {index + 1} of {totalSteps}
        </div>
      </div>

      {onRoute && preload && (preload.belief || preload.sellRule || preload.vectorRoute) && (
        <div
          role="note"
          aria-label="Already answered from your conversation with Stack AI"
          style={{ marginBottom: '1.25rem', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent)', background: 'var(--color-surface)' }}
        >
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 6 }}>
            Already answered, in your words
          </div>
          {preload.belief && (
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>“{preload.belief}”</p>
          )}
          {preload.sellRule && (
            <p style={{ margin: preload.belief ? '6px 0 0' : 0, fontSize: '0.95rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>“{preload.sellRule}”</p>
          )}
          <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            From your conversation with Stack AI. You can change these when you reach them.
          </p>
        </div>
      )}

      {onRoute ? (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            {ROUTE_QUESTION.text}
          </legend>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>{ROUTE_QUESTION.help}</p>
          {preload?.vectorRoute && session.route === preload.vectorRoute && preload.vectorRouteCitation && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-accent)', marginBottom: 12 }}>
              Answered from your conversation: <em style={{ color: 'var(--color-text-primary)' }}>“{preload.vectorRouteCitation}”</em>
            </p>
          )}
          {ROUTE_QUESTION.options.map((o) => (
            <OptionRow
              key={o.id}
              label={o.text}
              selected={session.route === o.id}
              onClick={() => chooseRoute(o.id)}
            />
          ))}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={session.answeredBy === 'proxy'}
              onChange={(e) => toggleAnsweredBy(e.target.checked ? 'proxy' : 'self')}
            />
            I&apos;m answering on behalf of someone else.
          </label>
        </fieldset>
      ) : question ? (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            {question.text}
          </legend>
          {question.help && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>{question.help}</p>}
          {preAnswered && currentAnswer?.text && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-accent)', marginBottom: 12 }}>
              Answered from your conversation: <em style={{ color: 'var(--color-text-primary)' }}>“{currentAnswer.text}”</em>
            </p>
          )}
          {question.options.map((o) => (
            <OptionRow
              key={o.id}
              label={o.text}
              help={o.help}
              multi={question.multiSelect}
              selected={(currentAnswer?.selectedOptionIds ?? []).includes(o.id)}
              onClick={() => selectOption(o.id)}
            />
          ))}
          {question.optionalText && (
            <textarea
              value={currentAnswer?.text ?? ''}
              onChange={(e) => setOptionalText(e.target.value)}
              placeholder={question.optionalText.prompt}
              rows={3}
              style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
          )}
        </fieldset>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {index > 0 && (
            <button onClick={handleBack} style={secondaryBtn}>
              &larr; Back
            </button>
          )}
          <button onClick={handleRestart} style={{ ...secondaryBtn, color: 'var(--color-text-muted)' }}>
            Start over
          </button>
        </div>
        <button onClick={handleContinue} disabled={!canContinue} style={primaryBtn(canContinue)}>
          {isLast ? 'See my profile' : 'Continue →'}
        </button>
      </div>
    </PageWrapper>
  );
}

function OptionRow({
  label,
  help,
  selected,
  multi,
  onClick,
}: {
  label: string;
  help?: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '0.85rem 1rem',
        marginBottom: 8,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-primary-subtle, rgba(0,0,0,0.03))' : 'transparent',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'border-color 0.15s ease',
      }}
    >
      {label}
      {help && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{help}</span>}
    </button>
  );
}

const secondaryBtn: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
};

function primaryBtn(enabled: boolean): React.CSSProperties {
  return {
    padding: '0.75rem 2rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    backgroundColor: enabled ? 'var(--color-primary)' : 'var(--color-border)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.5,
  };
}
