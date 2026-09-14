// GAP-267 Phase 1 - v2 funnel analytics.
//
// Distinguishes each funnel step, versions every event, and deduplicates
// milestone events across refresh. NEVER sends raw answers, free text, or
// financial amounts - only step ids, route, and coarse outcomes.

const EVENT_VERSION = 'v2';
const DEDUP_KEY = 'vector_v2_events_fired';

function gtag(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (w.gtag) w.gtag('event', name, { ...params, event_version: EVENT_VERSION });
}

// Fire at most once per browser session for milestone events.
function once(name: string, fn: () => void) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(DEDUP_KEY);
    const fired: string[] = raw ? JSON.parse(raw) : [];
    if (fired.includes(name)) return;
    fired.push(name);
    window.sessionStorage.setItem(DEDUP_KEY, JSON.stringify(fired));
  } catch {
    // if sessionStorage is unavailable, fall through and fire (better than losing the event)
  }
  fn();
}

export const trackV2 = {
  landingCta: () => gtag('vector_v2_landing_cta', {}),
  quizArrived: () => once('quiz_arrived', () => gtag('vector_v2_quiz_arrived', {})),
  firstAnswer: (route: string) => once('first_answer', () => gtag('vector_v2_first_answer', { route })),
  stepCompleted: (stepId: string, index: number) => gtag('vector_v2_step_completed', { step_id: stepId, step_index: index }),
  // outcome: 'success' | 'fallback' | 'failure'
  resultGenerated: (outcome: string, route: string) => gtag('vector_v2_result', { outcome, route }),
  profileConfirmed: () => gtag('vector_v2_profile_confirmed', {}),
  profileCorrected: () => gtag('vector_v2_profile_corrected', {}),
  download: () => gtag('vector_v2_download', {}),
  emailCaptured: (route: string) => gtag('vector_v2_email_captured', { route }),
  handoff: () => gtag('vector_v2_handoff', {}),
};

// Called on a full restart so a fresh run can re-emit milestone events.
export function resetV2Analytics(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DEDUP_KEY);
  } catch {
    // ignore
  }
}
