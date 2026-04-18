import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './promptBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env['PORT'] || '3001', 10);
const API_KEY = process.env['VECTOR_ANTHROPIC_API_KEY'] || '';
const MODEL = process.env['VECTOR_CLAUDE_MODEL'] || 'claude-haiku-4-5-20251001';

if (!API_KEY) {
  console.warn('[proxy] VECTOR_ANTHROPIC_API_KEY is not set. All API calls will return fallback.');
}

const anthropic = API_KEY ? new Anthropic({ apiKey: API_KEY }) : null;

const TIMEOUT_MS: Record<string, number> = {
  profile: 8000,
  discovery: 6000,
};

interface GenerateRequest {
  type: 'profile' | 'discovery';
  payload: Record<string, unknown>;
  theme?: string;
}

app.post('/api/generate', async (req: express.Request, res: express.Response): Promise<void> => {
  const { type, payload, theme } = req.body as GenerateRequest;

  if (!type || !payload) {
    res.status(400).json({ error: 'Missing type or payload', fallback: true });
    return;
  }

  if (type === 'discovery' && !theme) {
    res.status(400).json({ error: 'Missing theme for discovery type', fallback: true });
    return;
  }

  if (!anthropic) {
    res.json({ error: 'API key not configured', fallback: true });
    return;
  }

  const systemPrompt = buildSystemPrompt(type);
  let userMessage: string;

  if (type === 'profile') {
    userMessage = `Here is the user's complete Vector answer data:\n\n${JSON.stringify(payload, null, 2)}`;
  } else {
    userMessage = `Here is the user's complete Vector answer data and the theme to generate instrument commentary for:\n\nAnswer Data:\n${JSON.stringify(payload, null, 2)}\n\nTheme: ${theme}`;
  }

  const timeoutMs = TIMEOUT_MS[type] || 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );

    clearTimeout(timer);

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('[proxy] No text block in API response');
      res.json({ error: 'Empty response', fallback: true });
      return;
    }

    res.json({ content: textBlock.text, model: response.model });
  } catch (err: unknown) {
    clearTimeout(timer);
    const error = err as Error & { status?: number };

    if (error.name === 'AbortError' || controller.signal.aborted) {
      console.warn(`[proxy] ${type} call timed out after ${timeoutMs}ms`);
      res.json({ error: 'Timeout', fallback: true });
      return;
    }

    if (error.status === 429) {
      console.warn('[proxy] Rate limited by Anthropic API');
      res.json({ error: 'Rate limited', fallback: true });
      return;
    }

    console.error('[proxy] API error:', error.message || error);
    res.json({ error: 'API error', fallback: true });
  }
});

// Serve static React build in production (only if dist exists)
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[proxy] Vector API proxy running on port ${PORT}`);
  console.log(`[proxy] Model: ${MODEL}`);
  console.log(`[proxy] API key configured: ${!!API_KEY}`);
});
