// GAP-267 Phase 1 - build and send the v2 capture payload to StackMotive (via
// the Vector server proxy /api/vector/capture-v2 -> StackMotive /ingest-v2).
//
// Confirmed beliefs (only for a confirmed, self-answered profile) become
// canonical philosophy names -> vector_philosophy_themes. Everything exploratory
// (learning interests, considering beliefs, and any belief with no canonical
// mapping) becomes exploratory_interests -> the separate store. A proxy answerer
// never contributes a confirmed belief. No answer content is sent beyond what
// the user confirmed.

import type { V2Profile } from '../types/v2';
import { beliefToCanonicalPhilosophy } from '../data/beliefPhilosophyMap';

export interface V2CapturePayload {
  email: string;
  questionnaire_version: string;
  interpretation_version: string;
  route: string;
  answered_by: string;
  confirmed_beliefs: string[];
  exploratory_interests: string[];
  vector_country?: string | null;
}

export function buildV2CapturePayload(
  profile: V2Profile,
  email: string,
  opts?: { country?: string | null },
): V2CapturePayload {
  const beliefOptionId = profile.answers.find((a) => a.questionId === 'explicitBelief')?.selectedOptionIds[0];
  const canonical = beliefToCanonicalPhilosophy(beliefOptionId);

  const confirmed: string[] = [];
  const exploratory: string[] = [];

  for (const b of profile.beliefs) {
    if (b.status === 'confirmed' && profile.answeredBy !== 'proxy' && canonical) {
      // A confirmed, self-answered, mappable belief is a declared theme.
      confirmed.push(canonical);
    } else {
      // Everything else stays exploratory (never a declaration).
      exploratory.push(b.theme);
    }
  }

  return {
    email: email.trim(),
    questionnaire_version: profile.questionnaireVersion,
    interpretation_version: profile.interpretationVersion,
    route: profile.route,
    answered_by: profile.answeredBy,
    confirmed_beliefs: [...new Set(confirmed)],
    exploratory_interests: [...new Set(exploratory)],
    vector_country: opts?.country ?? null,
  };
}

export async function captureV2(payload: V2CapturePayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/vector/capture-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `Server error: ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}
