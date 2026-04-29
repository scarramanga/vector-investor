/**
 * StackMotive API client for follow-up email enrichment.
 *
 * - User lookup: GET /api/internal/user-by-email (auth required)
 * - Macro data: GET /api/cpi, /api/treasury, /api/fiat-debasement (no auth)
 * - Macro series: GET /api/macro/series?series_id=CPIAUCSL (auth required)
 */

const STACKMOTIVE_BASE = 'https://api.stackmotiveapp.com';

export interface StackMotiveUser {
  user_id: number;
  tier: string;
  has_positions: boolean;
}

/**
 * Look up a Vector user in the StackMotive system.
 * Returns null if the user has no StackMotive account (404).
 */
export async function lookupStackMotiveUser(email: string): Promise<StackMotiveUser | null> {
  const token = process.env['STACKMOTIVE_TOKEN'];
  if (!token) {
    console.warn('[stackmotive] STACKMOTIVE_TOKEN is not set. Skipping user lookup.');
    return null;
  }

  try {
    const url = `${STACKMOTIVE_BASE}/api/internal/user-by-email?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`[stackmotive] User lookup failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = (await res.json()) as StackMotiveUser;
    return data;
  } catch (err) {
    console.error('[stackmotive] User lookup error:', err);
    return null;
  }
}

export interface MacroData {
  cpi: unknown;
  treasury: unknown;
  fiatDebasement: unknown;
  cpiSeries: unknown;
}

/**
 * Fetch current macro data from StackMotive public and authenticated endpoints.
 * Returns whatever data is available; individual failures are logged and skipped.
 */
export async function fetchMacroData(): Promise<MacroData> {
  const token = process.env['STACKMOTIVE_TOKEN'];
  const result: MacroData = {
    cpi: null,
    treasury: null,
    fiatDebasement: null,
    cpiSeries: null,
  };

  const fetchEndpoint = async (path: string, auth: boolean): Promise<unknown> => {
    try {
      const headers: Record<string, string> = {};
      if (auth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${STACKMOTIVE_BASE}${path}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`[stackmotive] ${path} returned ${res.status}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.warn(`[stackmotive] ${path} fetch error:`, err);
      return null;
    }
  };

  const [cpi, treasury, fiatDebasement, cpiSeries] = await Promise.all([
    fetchEndpoint('/api/cpi', false),
    fetchEndpoint('/api/treasury', false),
    fetchEndpoint('/api/fiat-debasement', false),
    fetchEndpoint('/api/macro/series?series_id=CPIAUCSL', true),
  ]);

  result.cpi = cpi;
  result.treasury = treasury;
  result.fiatDebasement = fiatDebasement;
  result.cpiSeries = cpiSeries;

  return result;
}
