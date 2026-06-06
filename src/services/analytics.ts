declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

export function trackQuizStarted() {
  gtag('event', 'vector_quiz_started');
}

export function trackQuizCompleted(persona: string, capitalBand: string) {
  gtag('event', 'vector_quiz_completed', { persona, capital_band: capitalBand });
}

export function trackEmailCaptured(persona: string) {
  gtag('event', 'vector_email_captured', { persona });
}
