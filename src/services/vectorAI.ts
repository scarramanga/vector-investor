import type { VectorAnswerPayload } from '../types/vector';

interface GenerateResponse {
  content?: string;
  model?: string;
  error?: string;
  fallback?: boolean;
}

export async function fetchProfileNarrative(
  payload: VectorAnswerPayload,
): Promise<string | null> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'profile', payload }),
    });

    const data: GenerateResponse = await res.json();

    if (data.fallback || !data.content) {
      return null;
    }

    return data.content;
  } catch {
    return null;
  }
}

export async function fetchInstrumentCommentary(
  payload: VectorAnswerPayload,
  theme: string,
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'discovery', payload, theme }),
    });

    const data: GenerateResponse = await res.json();

    if (data.fallback || !data.content) {
      return null;
    }

    // Strip markdown fences if Claude wraps the JSON
    let jsonStr = data.content;
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    }

    const parsed: unknown = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }

    return null;
  } catch {
    return null;
  }
}
