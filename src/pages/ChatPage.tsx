// Stack AI page (Ripen spec, Build 2). One page, one chat box, StackMotive
// branding, thin: the token in the URL is the whole identity, the engine
// holds the conversation, this page renders it. Reopen restores everything
// from the API before the person types. Mobile first.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  loadConversation,
  platformDoorHref,
  revealNext,
  sendMessage,
  splitStream,
  type ConversationState,
  type Door,
  type HistoryTurn,
} from '../services/stackAiChat';
import { preloadFromDoor, savePreload } from '../services/chatPreload';
import { clearSession } from '../services/quizSessionV2';

type Bubble =
  | { kind: 'turn'; who: HistoryTurn['who']; text: string; streaming?: boolean }
  | { kind: 'door'; door: Door };

const WORD_INTERVAL_MS = 55;

export default function ChatPage() {
  const [params] = useSearchParams();
  const token = (params.get('token') || '').trim();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false); // a reply is in flight (thinking or streaming)
  const [thinking, setThinking] = useState(false); // before the first word
  const [pendingDoor, setPendingDoor] = useState<Door | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reopen: the whole conversation comes from the API first.
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setClosedMessage("This conversation isn't available. If you'd like to talk to StackMotive, reply to Andy's email.");
      setLoading(false);
      return;
    }
    loadConversation(token)
      .then((state: ConversationState) => {
        if (cancelled) return;
        if (state.status === 'closed') {
          setClosedMessage(state.message || "This conversation isn't available. If you'd like to talk to StackMotive, reply to Andy's email.");
          return;
        }
        const list: Bubble[] = state.history.map((h) => ({ kind: 'turn', who: h.who, text: h.text }));
        if (state.door) list.push({ kind: 'door', door: state.door });
        setBubbles(list);
      })
      .catch(() => {
        if (!cancelled) setClosedMessage("This conversation isn't available right now. If you'd like to talk to StackMotive, reply to Andy's email.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Keep the newest line in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bubbles, thinking]);

  const setLastAssistantText = useCallback((text: string, streaming: boolean) => {
    setBubbles((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        const b = next[i];
        if (b.kind === 'turn' && b.who === 'stackai' && b.streaming) {
          next[i] = { kind: 'turn', who: 'stackai', text, streaming };
          return next;
        }
      }
      return next;
    });
  }, []);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || busy || !token) return;
    setDraft('');
    setBusy(true);
    setThinking(true);
    setPendingDoor(null);
    setBubbles((prev) => [
      ...prev,
      { kind: 'turn', who: 'prospect', text },
      { kind: 'turn', who: 'stackai', text: '', streaming: true },
    ]);

    let result;
    try {
      result = await sendMessage(token, text);
    } catch {
      result = { body: null, message: "This conversation isn't available right now. If you'd like to talk to StackMotive, reply to Andy's email." };
    }

    if (!result.body) {
      // A plain answer: closed, a pause, or nothing to say. Shown as a line, never an error.
      setThinking(false);
      if (result.status === 'closed') {
        setClosedMessage(result.message || "This conversation isn't available. If you'd like to talk to StackMotive, reply to Andy's email.");
      } else {
        setLastAssistantText(result.message || '', false);
      }
      setBusy(false);
      return;
    }

    // Read the stream into a buffer; play it out one word at a time.
    const reader = result.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let final = false;
    let shownWords = 0;
    let door: Door | null = null;

    const pump = (async () => {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
      buffer += decoder.decode();
      final = true;
    })();

    await new Promise<void>((resolve) => {
      const tick = () => {
        const parsed = splitStream(buffer);
        if (parsed.door) door = parsed.door;
        const step = revealNext(parsed.text, shownWords, final);
        if (step.words > shownWords) {
          shownWords = step.words;
          setThinking(false);
          setLastAssistantText(step.text, true);
        }
        if (step.done || (final && step.words === shownWords && step.text.length >= parsed.text.length)) {
          setThinking(false);
          setLastAssistantText(step.text, false);
          resolve();
          return;
        }
        setTimeout(tick, WORD_INTERVAL_MS);
      };
      tick();
    });
    await pump;

    if (door) {
      setPendingDoor(door);
      setBubbles((prev) => [...prev, { kind: 'door', door: door as Door }]);
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  function openVectorDoor(door: Door) {
    const preload = preloadFromDoor(token, door.payload);
    savePreload(preload);
    clearSession(); // a fresh questionnaire, opened with the pre-load in place
    navigate(`/quiz-v2?token=${encodeURIComponent(token)}`, { state: { preload } });
  }

  if (loading) {
    return (
      <Shell>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Opening your conversation…</p>
      </Shell>
    );
  }

  if (closedMessage) {
    // The fixed message, as a plain page. Not an error.
    return (
      <Shell>
        <p style={{ color: 'var(--color-text-primary)', fontSize: '1rem', lineHeight: 1.6 }}>{closedMessage}</p>
      </Shell>
    );
  }

  return (
    <Shell fill>
      <div
        ref={logRef}
        aria-live="polite"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {bubbles.map((b, i) =>
          b.kind === 'door' ? (
            <DoorCard key={i} door={b.door} token={token} onVector={() => openVectorDoor(b.door)} />
          ) : (
            <MessageBubble key={i} who={b.who} text={b.text} streaming={b.streaming === true} thinking={b.streaming === true && thinking} />
          ),
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, paddingTop: 8, paddingBottom: 'env(safe-area-inset-bottom)', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, background: 'var(--color-bg)' }}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={pendingDoor ? 'Or keep talking…' : 'Type your answer'}
          rows={1}
          aria-label="Your message"
          disabled={busy}
          style={{
            flex: 1,
            minWidth: 0,
            resize: 'none',
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontFamily: 'inherit',
            fontSize: '1rem',
            lineHeight: 1.4,
            minHeight: 44,
          }}
        />
        <button type="submit" disabled={busy || !draft.trim()} style={primaryBtn(!busy && Boolean(draft.trim()))} aria-label="Send">
          Send
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children, fill }: { children: React.ReactNode; fill?: boolean }) {
  return (
    <div style={{ height: fill ? '100dvh' : undefined, minHeight: fill ? undefined : '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, padding: '0 1rem', display: 'flex', flexDirection: 'column', flex: fill ? 1 : undefined, minHeight: 0, height: fill ? '100%' : undefined, overflowX: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '1rem 0 0.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              Stack<span style={{ color: 'var(--color-accent)' }}>Motive</span>
            </div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: 2 }}>
              Stack AI · Intelligence agent
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>An AI. Not advice.</div>
        </header>
        {children}
      </div>
    </div>
  );
}

function MessageBubble({ who, text, streaming, thinking }: { who: HistoryTurn['who']; text: string; streaming: boolean; thinking: boolean }) {
  const mine = who === 'prospect';
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '88%',
          padding: '0.75rem 0.95rem',
          borderRadius: 'var(--radius-lg)',
          borderBottomRightRadius: mine ? 4 : undefined,
          borderBottomLeftRadius: mine ? undefined : 4,
          background: mine ? 'var(--color-primary)' : 'var(--color-surface)',
          border: mine ? 'none' : '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontSize: '0.975rem',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {thinking ? (
          <span className="stackai-thinking" aria-label="Stack AI is thinking">
            <i /><i /><i />
          </span>
        ) : (
          <>
            {text}
            {streaming && <span className="stackai-cursor" aria-hidden="true" />}
          </>
        )}
      </div>
    </div>
  );
}

function DoorCard({ door, token, onVector }: { door: Door; token: string; onVector: () => void }) {
  const name = door.door;
  const belief = typeof door.payload?.belief === 'string' ? door.payload.belief : null;
  const rule = typeof door.payload?.sell_rule === 'string' ? door.payload.sell_rule : null;

  const title = name === 'vector' ? 'Map your investor profile' : name === 'platform' ? 'Open StackMotive' : 'Talk to Andy';
  const line =
    name === 'vector'
      ? 'Vector is a short questionnaire. What you have said here is already filled in, in your words.'
      : name === 'platform'
        ? 'The platform, with what you have said here carried across.'
        : 'A call, when Andy confirms a time.';

  return (
    <div
      role="group"
      aria-label={`${title} door`}
      style={{
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.95rem 1rem',
        background: 'var(--color-surface)',
      }}
    >
      <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 6 }}>A door</div>
      <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0 0 10px' }}>{line}</p>
      {(belief || rule) && (
        <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: 10, marginBottom: 12 }}>
          {belief && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>“{belief}”</p>}
          {rule && <p style={{ margin: belief ? '6px 0 0' : 0, fontSize: '0.9rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>“{rule}”</p>}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {name === 'vector' ? (
          <button type="button" onClick={onVector} style={primaryBtn(true)}>
            Open Vector
          </button>
        ) : name === 'platform' ? (
          <a href={platformDoorHref(token)} style={{ ...primaryBtn(true), textDecoration: 'none', display: 'inline-block' }}>
            Open StackMotive
          </a>
        ) : (
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Andy will confirm a time by email.</span>
        )}
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>or keep talking</span>
      </div>
    </div>
  );
}

function primaryBtn(enabled: boolean): React.CSSProperties {
  return {
    padding: '0.75rem 1.25rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    backgroundColor: enabled ? 'var(--color-primary)' : 'var(--color-border)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.5,
    minHeight: 44,
  };
}
