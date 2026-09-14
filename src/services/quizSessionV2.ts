// GAP-267 Phase 1 - v2 quiz session persistence.
//
// Preserves progress across accidental refresh with a session expiry and a
// clear/restart action. Stored in localStorage; no analytics, no PII beyond the
// answers the user is mid-way through giving.

import type { AnsweredBy, RouteId, V2Answer } from '../types/v2';
import { QUESTIONNAIRE_VERSION } from '../types/v2';

const KEY = 'vector_quiz_v2';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export interface QuizSessionV2 {
  version: string; // questionnaire version - a mismatch discards the old session
  startedAt: number;
  route: RouteId | null;
  answeredBy: AnsweredBy;
  answers: V2Answer[];
  index: number; // current step index within the visible sequence
}

function fresh(): QuizSessionV2 {
  return {
    version: QUESTIONNAIRE_VERSION,
    startedAt: 0, // stamped on first answer, not on arrival
    route: null,
    answeredBy: 'self',
    answers: [],
    index: 0,
  };
}

export function loadSession(now: number): QuizSessionV2 {
  if (typeof window === 'undefined') return fresh();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw) as QuizSessionV2;
    if (s.version !== QUESTIONNAIRE_VERSION) return fresh(); // version bump discards
    if (s.startedAt && now - s.startedAt > EXPIRY_MS) {
      clearSession();
      return fresh();
    }
    return { ...fresh(), ...s };
  } catch {
    return fresh();
  }
}

export function saveSession(s: QuizSessionV2): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage unavailable (private mode / quota) - the quiz still works in-memory
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function upsertAnswer(answers: V2Answer[], answer: V2Answer): V2Answer[] {
  const next = answers.filter((a) => a.questionId !== answer.questionId);
  next.push(answer);
  return next;
}
