export interface CaptureResponse {
  status: 'captured' | 'existing_profile' | 'error';
  profileId?: number;
  sessionToken?: string;
  existingProfile?: {
    id: number;
    persona: string;
    capitalBand: string;
    createdAt: string;
  };
  newProfile?: {
    persona: string;
    capitalBand: string;
  };
  error?: string;
}

export interface SkipResponse {
  status: 'skipped';
  sessionToken?: string;
}

export interface KeepExistingResponse {
  status: 'kept_existing';
  profileId: number;
  sessionToken: string;
}

export async function captureEmail(data: {
  email: string;
  country: string | null;
  persona: string;
  capitalBand: string;
  philosophy: string | null;
  answers: Record<string, unknown>;
  payload: Record<string, unknown>;
  tierName: string;
  replaceExisting?: boolean;
}): Promise<CaptureResponse> {
  try {
    const res = await fetch('/api/vector/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return { status: 'error', error: `Server error: ${res.status}` };
    }

    return await res.json();
  } catch {
    return { status: 'error', error: 'Network error' };
  }
}

export async function keepExistingProfile(email: string): Promise<KeepExistingResponse | null> {
  try {
    const res = await fetch('/api/vector/keep-existing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function skipCapture(data: {
  persona: string;
  capitalBand: string;
  payload: Record<string, unknown>;
}): Promise<SkipResponse | null> {
  try {
    const res = await fetch('/api/vector/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
