import { useState } from 'react';
import type { PersonaType, CapitalBand } from '../../types';
import type { VectorAnswerPayload } from '../../types/vector';
import { getTierRecommendation } from '../../data/tierRecommendations';
import { captureEmail, keepExistingProfile, skipCapture } from '../../services/vectorCapture';
import type { CaptureResponse } from '../../services/vectorCapture';

// Philosophy is a recommended default based on persona and life-stage, not a permanent
// assignment. Users can override their philosophy in StackMotive via the philosophy selection UI.
const PERSONA_PHILOSOPHY_MAP: Record<string, string> = {
  'awakening': 'Macro and Hard Assets',
  'gut-trader': 'Disruptive Growth',
  'swamped-analyst': 'Rules-Based Systematic',
  'comfortable-blind-spot': 'Value and Patience',
};

function getPhilosophy(persona: PersonaType, lifeStage: string | undefined): string {
  if (lifeStage === 'preservation') return 'Capital Preservation';
  return PERSONA_PHILOSOPHY_MAP[persona] || persona;
}

interface EmailCaptureProps {
  persona: PersonaType;
  capitalBand: CapitalBand;
  accentColor: string;
  answerPayload: VectorAnswerPayload;
  animationDelay: number;
  onComplete: (sessionToken: string | null, email: string | null, country: string | null, philosophy: string | null) => void;
  onSkip: () => void;
}

type Country = 'NZ' | 'AU' | 'UK' | 'CA' | 'OTHER';

const countryOptions: { value: Country; label: string }[] = [
  { value: 'NZ', label: 'New Zealand' },
  { value: 'AU', label: 'Australia' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'OTHER', label: 'Other' },
];

function formatPersonaLabel(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function EmailCapture({
  persona,
  capitalBand,
  accentColor,
  answerPayload,
  animationDelay,
  onComplete,
  onSkip,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<Country | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<CaptureResponse['existingProfile'] | null>(null);
  const [showDualProfile, setShowDualProfile] = useState(false);

  const tierRec = getTierRecommendation(persona, capitalBand);
  const philosophy = getPhilosophy(persona, answerPayload.lifeStage);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(replaceExisting?: boolean) {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await captureEmail({
      email: email.trim().toLowerCase(),
      country: country || null,
      persona,
      capitalBand,
      philosophy,
      answers: answerPayload.answers as unknown as Record<string, unknown>,
      payload: answerPayload as unknown as Record<string, unknown>,
      tierName: tierRec.tierName,
      replaceExisting,
    });

    setIsSubmitting(false);

    if (result.status === 'existing_profile' && result.existingProfile) {
      setExistingProfile(result.existingProfile);
      setShowDualProfile(true);
      return;
    }

    if (result.status === 'captured') {
      onComplete(result.sessionToken ?? null, email.trim().toLowerCase(), country || null, philosophy);
      return;
    }

    setError(result.error || 'Something went wrong. Please try again.');
  }

  async function handleKeepExisting() {
    setIsSubmitting(true);
    setError(null);
    const result = await keepExistingProfile(email.trim().toLowerCase());
    setIsSubmitting(false);

    if (result) {
      onComplete(result.sessionToken, email.trim().toLowerCase(), country || null, philosophy);
    } else {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleSkip() {
    const result = await skipCapture({
      persona,
      capitalBand,
      payload: answerPayload as unknown as Record<string, unknown>,
    });
    onSkip();
    if (result?.sessionToken) {
      onComplete(result.sessionToken, null, null, null);
    }
  }

  // Edge Case 1 — Dual-profile UI
  if (showDualProfile && existingProfile) {
    return (
      <div
        style={{
          animation: `fadeSlideUp 0.6s ease both`,
          animationDelay: `${animationDelay}ms`,
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '32px 24px',
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
            EXISTING PROFILE FOUND
          </p>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: '24px',
            }}
          >
            You already have a Vector profile on file. Would you like to keep your original profile or use your new one?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* Existing profile */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Original profile — {new Date(existingProfile.createdAt).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {formatPersonaLabel(existingProfile.persona)} · {existingProfile.capitalBand}
              </p>
            </div>

            {/* New profile */}
            <div
              style={{
                border: `1px solid ${accentColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                New profile — today
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {formatPersonaLabel(persona)} · {capitalBand}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                backgroundColor: accentColor,
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {isSubmitting ? 'Updating...' : 'Use my new profile'}
            </button>
            <button
              onClick={handleKeepExisting}
              disabled={isSubmitting}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {isSubmitting ? 'Updating...' : 'Keep my original profile'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default email capture form
  return (
    <div
      style={{
        animation: `fadeSlideUp 0.6s ease both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '32px 24px',
        }}
      >
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}
        >
          Want us to send you your profile report and keep you updated with intelligence relevant to
          your philosophy? Enter your email below. No spam. Unsubscribe any time.
        </p>

        {/* Email input */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accentColor;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          />
        </div>

        {/* Country selector */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginBottom: '6px',
            }}
          >
            Your location
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country | '')}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              color: country ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              boxSizing: 'border-box',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
            }}
          >
            <option value="">Select country</option>
            {countryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tier recommendation */}
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '8px',
            }}
          >
            Based on your profile, <strong style={{ color: 'var(--color-text-primary)' }}>{tierRec.description}</strong> is
            your starting point on StackMotive.
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {tierRec.tierName === 'Observer' &&
              'You get a free 5-minute preview of Navigator every day. If you want full access to Navigator for the rest of this month, unlock it for NZD $2.90. No commitment.'}
            {tierRec.tierName === 'Navigator' &&
              'You get a free 5-minute preview of Operator every day. If you want full access to Operator for the rest of this month, unlock it for NZD $9.90. No commitment.'}
            {tierRec.tierName === 'Operator' &&
              'You get a free 5-minute preview of Sovereign every day. If you want full access to Sovereign for the rest of this month, unlock it for NZD $24.90. No commitment.'}
          </p>
        </div>

        {/* Submit button */}
        <button
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !email.trim()}
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: accentColor,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: isSubmitting || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !email.trim() ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
            marginBottom: '16px',
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send me my profile'}
        </button>

        {error && (
          <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Skip link */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            No thanks, take me to StackMotive
          </button>
        </div>
      </div>
    </div>
  );
}
