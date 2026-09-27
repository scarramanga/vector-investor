// Stack AI page (Ripen spec, Build 2). The client side of the conversation:
// the API contract as types, the stream parser, and the word ticker that
// plays a reply out one word at a time. Pure functions where possible so the
// page's behaviour is testable without a browser.

export type DoorName = 'vector' | 'platform' | 'call';

// What the API pre-loads with a door (built from cited rows, never invented).
export interface DoorPayload {
  route?: string; // the door's own name, not a Vector route
  belief?: string | null;
  belief_reason?: string | null;
  sell_rule?: string | null;
  sell_rule_kind?: 'rule' | 'gap' | string | null;
  [key: string]: unknown;
}

export interface Door {
  door: DoorName | string;
  payload: DoorPayload;
  citation?: string;
}

export interface HistoryTurn {
  turn: number;
  who: 'stackai' | 'prospect';
  text: string;
}

export type ConversationStatus = 'open' | 'closed' | 'dormant';

export interface ConversationState {
  status: ConversationStatus;
  message?: string; // the fixed page-safe text when closed
  history: HistoryTurn[];
  door: Door | null;
}

export const DOOR_MARKER = '<<door>>';

// Splits a stream buffer into the visible reply and, once the trailer has
// fully arrived, the door. The trailer is a single JSON object on the last
// line; until it parses, the door stays null and the text is everything
// before the marker.
export function splitStream(buffer: string): { text: string; door: Door | null; complete: boolean } {
  const i = buffer.indexOf(DOOR_MARKER);
  if (i < 0) return { text: buffer, door: null, complete: false };
  const text = buffer.slice(0, i).replace(/\s+$/, '');
  const raw = buffer.slice(i + DOOR_MARKER.length).trim();
  if (!raw) return { text, door: null, complete: false };
  try {
    const parsed = JSON.parse(raw) as Door;
    if (parsed && typeof parsed.door === 'string') return { text, door: parsed, complete: true };
  } catch {
    // trailer still arriving
  }
  return { text, door: null, complete: false };
}

// Word-by-word playback. Given the text received so far and how many words
// are already shown, returns the next visible prefix (one more word, keeping
// the original whitespace and line breaks). `final` means the stream ended,
// so the trailing partial word may be shown too.
export function wordsOf(text: string): string[] {
  // Tokens are runs of non-space or runs of whitespace, so joining them back
  // reproduces the text exactly.
  return text.match(/\S+|\s+/g) ?? [];
}

export function revealNext(received: string, shownWordCount: number, final: boolean): { text: string; words: number; done: boolean } {
  const tokens = wordsOf(received);
  // Count only word tokens toward "shown"; whitespace rides along with the word before it.
  const wordTokens: string[] = [];
  let acc = '';
  for (const t of tokens) {
    if (/\s/.test(t[0])) {
      if (wordTokens.length) wordTokens[wordTokens.length - 1] += t;
      else acc += t; // leading whitespace
    } else {
      wordTokens.push(acc + t);
      acc = '';
    }
  }
  // Hold back the last word until the stream is final, since it may be partial.
  const available = final ? wordTokens.length : Math.max(0, wordTokens.length - 1);
  const next = Math.min(available, shownWordCount + 1);
  const text = wordTokens.slice(0, next).join('');
  return { text, words: next, done: final && next >= wordTokens.length };
}

// Where the page calls. Same origin; the server relays to the engine.
export const CHAT_API_PREFIX = '/api/chat';

export async function loadConversation(token: string): Promise<ConversationState> {
  const r = await fetch(`${CHAT_API_PREFIX}/${encodeURIComponent(token)}`);
  const d = (await r.json()) as Partial<ConversationState>;
  return {
    status: (d.status as ConversationStatus) || 'closed',
    message: d.message,
    history: Array.isArray(d.history) ? d.history : [],
    door: d.door ?? null,
  };
}

export interface SendResult {
  // Either a stream to read, or a plain JSON answer (closed, rate limited, empty).
  body: ReadableStream<Uint8Array> | null;
  message?: string;
  status?: ConversationStatus;
}

export async function sendMessage(token: string, text: string): Promise<SendResult> {
  const r = await fetch(`${CHAT_API_PREFIX}/${encodeURIComponent(token)}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const ct = r.headers.get('content-type') || '';
  if (ct.startsWith('text/plain') && r.body) return { body: r.body };
  const d = (await r.json().catch(() => ({}))) as { message?: string; status?: ConversationStatus };
  return { body: null, message: d.message, status: d.status };
}

// The platform door: app.stackmotiveapp.com with the token in the link.
export const PLATFORM_URL = 'https://app.stackmotiveapp.com/welcome';

export function platformDoorHref(token: string): string {
  const u = new URL(PLATFORM_URL);
  u.searchParams.set('token', token);
  return u.toString();
}
