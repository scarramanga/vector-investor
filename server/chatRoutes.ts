// Stack AI page (Ripen spec, Build 2). The page is thin and holds no state:
// these two routes pass the prospect's token through to the conversation API
// and relay its answers byte for byte. The base URL is a config setting so the
// same page works against a local engine (default) and, later, the deployed
// one. Nothing the prospect sees names the engine.
import express from 'express';
import { Readable } from 'node:stream';

export const STACKAI_API_BASE_DEFAULT = 'http://127.0.0.1:8790';

// The fixed page-safe message, used only when the API itself cannot be
// reached. The API's own closed/unavailable answers are relayed unchanged.
export const UNREACHABLE_MESSAGE =
  "This conversation isn't available right now. If you'd like to talk to StackMotive, reply to Andy's email.";

export function stackAiApiBase(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env['STACKAI_API_BASE'] || STACKAI_API_BASE_DEFAULT).trim();
  return raw.replace(/\/+$/, '');
}

// A token is opaque; the only guard here is that it fits in a path segment.
export function tokenIsWellFormed(token: string): boolean {
  return /^[A-Za-z0-9_-]{8,128}$/.test(token);
}

const router = express.Router();

// GET /api/chat/:token -> history and any earned door (also used for reopen).
router.get('/:token', async (req: express.Request, res: express.Response): Promise<void> => {
  const token = String(req.params['token'] ?? '');
  if (!tokenIsWellFormed(token)) {
    res.status(200).json({ status: 'closed', message: UNREACHABLE_MESSAGE, history: [], door: null });
    return;
  }
  try {
    const upstream = await fetch(`${stackAiApiBase()}/conversation/${encodeURIComponent(token)}`, {
      signal: AbortSignal.timeout(15000),
    });
    const body = await upstream.text();
    res.status(upstream.status).type('application/json').send(body);
  } catch (err) {
    console.error('[chat] conversation API unreachable:', (err as Error).message);
    res.status(200).json({ status: 'closed', message: UNREACHABLE_MESSAGE, history: [], door: null });
  }
});

// POST /api/chat/:token/message -> the reply, streamed through as it arrives,
// then the API's own <<door>> trailer if a door was earned this turn.
router.post('/:token/message', async (req: express.Request, res: express.Response): Promise<void> => {
  const token = String(req.params['token'] ?? '');
  const text = typeof (req.body as { text?: unknown })?.text === 'string' ? (req.body as { text: string }).text : '';
  if (!tokenIsWellFormed(token)) {
    res.status(200).json({ status: 'closed', message: UNREACHABLE_MESSAGE });
    return;
  }
  let upstream: Response;
  try {
    upstream = await fetch(`${stackAiApiBase()}/conversation/${encodeURIComponent(token)}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(120000),
    });
  } catch (err) {
    console.error('[chat] conversation API unreachable:', (err as Error).message);
    res.status(200).json({ status: 'closed', message: UNREACHABLE_MESSAGE });
    return;
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (!contentType.startsWith('text/plain') || !upstream.body) {
    // A JSON answer: closed, rate-limited, or empty text. Relay as is.
    const body = await upstream.text();
    res.status(upstream.status).type('application/json').send(body);
    return;
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  const stream = Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream);
  stream.on('error', (err) => {
    console.error('[chat] stream error:', err.message);
    res.end();
  });
  stream.pipe(res);
});

export default router;
