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
