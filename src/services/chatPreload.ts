// Stack AI page (Ripen spec, Build 2). The Vector door carries what the
// conversation already holds, in the prospect's own words: a belief (rung 4)
// and a sell rule (rung 3a). The questionnaire opens with those answers in
// place rather than asking again. Nothing here is invented: only the quoted
// words are pre-filled, as the "another reason / in your own words" answer.

import type { RouteId, V2Answer } from '../types/v2';
import type { DoorPayload } from './stackAiChat';

const VECTOR_ROUTES: readonly RouteId[] = ['learning', 'developing', 'regular', 'established'];

const KEY = 'vector_chat_preload';

export interface ChatPreload {
  token: string;
  belief: string | null;
  sellRule: string | null;
  sellRuleKind: 'rule' | 'gap' | null;
  // 'Which best describes you?', when the engine could judge it from their words.
  vectorRoute: RouteId | null;
  vectorRouteCitation: string | null;
}

export function preloadFromDoor(token: string, payload: DoorPayload | undefined | null): ChatPreload {
  const kind = payload?.sell_rule_kind === 'rule' || payload?.sell_rule_kind === 'gap' ? payload.sell_rule_kind : null;
  const route = (VECTOR_ROUTES as readonly string[]).includes(String(payload?.vector_route ?? ''))
    ? (payload!.vector_route as RouteId)
    : null;
  const routeCitation = typeof payload?.vector_route_citation === 'string' && payload.vector_route_citation.trim()
    ? payload.vector_route_citation.trim()
    : null;
  return {
    token,
    // a route only counts with the words that earned it; otherwise Vector asks
    vectorRoute: route && routeCitation ? route : null,
    vectorRouteCitation: route && routeCitation ? routeCitation : null,
    belief: typeof payload?.belief === 'string' && payload.belief.trim() ? payload.belief.trim() : null,
    sellRule: typeof payload?.sell_rule === 'string' && payload.sell_rule.trim() ? payload.sell_rule.trim() : null,
    sellRuleKind: kind,
  };
}

// The answers a pre-load supplies. The belief is recorded against the
// explicit-belief question as "Another reason" with the prospect's words as
// the free text, so the readout quotes them and the capture treats the belief
// as exploratory (no canonical mapping is invented from prose). A stated sell
// rule is recorded as "a predefined rule" under what would change their mind;
// an admitted gap records nothing, because nothing was established.
export function answersFromPreload(p: ChatPreload): V2Answer[] {
  const out: V2Answer[] = [];
  if (p.belief) out.push({ questionId: 'explicitBelief', selectedOptionIds: ['other'], text: p.belief });
  if (p.sellRule && p.sellRuleKind === 'rule') out.push({ questionId: 'reconsideration', selectedOptionIds: ['rule'], text: p.sellRule });
  return out;
}

export function savePreload(p: ChatPreload): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // storage unavailable: the quiz still works, just without the pre-load surviving a refresh
  }
}

export function loadPreload(): ChatPreload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ChatPreload;
    return p && typeof p.token === 'string' ? p : null;
  } catch {
    return null;
  }
}

export function clearPreload(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
