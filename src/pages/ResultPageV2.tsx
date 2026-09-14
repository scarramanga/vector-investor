// GAP-267 Phase 1 - the v2 result readout. Four parts (what you told us / our
// interpretation / what remains unclear / a next step), each answer-anchored by
// the engine, plus confirm/correct. No persona box, no invented confidence, no
// advice. The readout is deterministic, so an AI outage never degrades it.
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { confirmProfile, interpret } from '../data/interpretationV2';
import type { AnsweredBy, RouteId, V2Answer, V2Profile } from '../types/v2';
import { clearSession } from '../services/quizSessionV2';
import { trackV2 } from '../services/analyticsV2';
import { buildV2CapturePayload, captureV2 } from '../services/vectorCaptureV2';

interface ResultState {
  route: RouteId;
  answeredBy: AnsweredBy;
  answers: V2Answer[];
}

export default function ResultPageV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedProfile, setConfirmedProfile] = useState<V2Profile | null>(null);
  const [email, setEmail] = useState('');

  const profile = useMemo(() => {
    if (!state?.route) return null;
    return interpret(state.route, state.answers ?? [], state.answeredBy ?? 'self');
  }, [state]);

  useEffect(() => {
    if (profile) trackV2.resultGenerated('success', profile.route);
  }, [profile]);

  // A refresh loses router state; send the user back to a clean start.
  if (!profile) {
    return (
      <PageWrapper>
        <p style={{ color: 'var(--color-text-secondary)' }}>Your session has expired. Let&apos;s start fresh.</p>
        <button onClick={() => navigate('/quiz-v2')} style={primaryBtn}>Start the questionnaire</button>
      </PageWrapper>
    );
  }

  function handleConfirm() {
    if (!profile) return;
    // promotes stated beliefs to confirmed (never for a proxy)
    setConfirmedProfile(confirmProfile(profile));
    trackV2.profileConfirmed();
    setConfirmed(true);
  }

  async function handleContinueToStackMotive() {
    if (confirmedProfile && email.trim()) {
      await captureV2(buildV2CapturePayload(confirmedProfile, email));
    }
    trackV2.handoff();
    window.location.href = 'https://app.stackmotiveapp.com/welcome';
  }

  function handleCorrect() {
    trackV2.profileCorrected();
    navigate('/quiz-v2');
  }

  function handleStartOver() {
    clearSession();
    navigate('/quiz-v2');
  }

  const r = profile.readout;

  return (
    <PageWrapper>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
        Your investor-approach profile
      </h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
        This describes how you approach investing. It does not assess what you should buy or whether you are ready to trade.
      </p>

      <Section title="What you told us" items={r.told} emptyNote="You haven't told us much yet - that's fine." />
      <Section title="Our interpretation" items={r.interpretation} emptyNote="We haven't drawn conclusions beyond your answers." />
      <Section title="What remains unclear" items={r.unclear} emptyNote="Nothing major is unclear from your answers." muted />

      <div style={{ margin: '20px 0', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>A useful next step</strong>
        <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>{r.nextStep}</p>
      </div>

      {!confirmed ? (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Is this an accurate description?
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleConfirm} style={primaryBtn}>Yes, that&apos;s accurate</button>
            <button onClick={handleCorrect} style={secondaryBtn}>Adjust my answers</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Confirmed. You can carry this profile into StackMotive, where you decide what, if anything, to declare.
          </p>
          <label style={{ display: 'block', marginTop: 12, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Your email (optional, to carry this profile across)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={handleContinueToStackMotive} style={primaryBtn}>
              Continue in StackMotive
            </button>
            <button onClick={handleStartOver} style={secondaryBtn}>Start over</button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function Section({ title, items, emptyNote, muted }: { title: string; items: string[]; emptyNote: string; muted?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>{emptyNote}</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {items.map((it, i) => (
            <li key={i} style={{ fontSize: '0.95rem', color: muted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', marginBottom: 6 }}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '0.75rem 1.75rem',
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-primary)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
};

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
