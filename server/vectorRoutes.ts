import express from 'express';
import { findProfileByEmail, createProfile, replaceProfile, createSession, cleanExpiredSessions } from './db.js';
import { sendWelcomeEmail } from './email.js';
import crypto from 'node:crypto';

const router = express.Router();

interface CaptureRequest {
  email: string;
  country: string | null;
  persona: string;
  capitalBand: string;
  answers: Record<string, unknown>;
  payload: Record<string, unknown>;
  tierName: string;
  replaceExisting?: boolean;
}

/**
 * POST /api/vector/capture
 * Stores email, country, and full payload. Sends welcome email.
 * Returns existing profile if email already has one (Edge Case 1).
 */
router.post('/capture', async (req: express.Request, res: express.Response): Promise<void> => {
  const body = req.body as CaptureRequest;

  if (!body.email || !body.persona || !body.capitalBand || !body.answers || !body.payload) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const email = body.email.trim().toLowerCase();

  try {
    // Check for existing profile (Edge Case 1)
    const existing = await findProfileByEmail(email);

    if (existing && !body.replaceExisting) {
      // Return existing profile for dual-profile UI
      res.json({
        status: 'existing_profile',
        existingProfile: {
          id: existing.id,
          persona: existing.persona,
          capitalBand: existing.capital_band,
          createdAt: existing.created_at,
        },
        newProfile: {
          persona: body.persona,
          capitalBand: body.capitalBand,
        },
      });
      return;
    }

    let profile;
    if (existing && body.replaceExisting) {
      // Edge Case 1: User chose new profile — move old to history
      profile = await replaceProfile(existing.id, {
        email,
        country: body.country,
        persona: body.persona,
        capitalBand: body.capitalBand,
        answers: body.answers,
        payload: body.payload,
      });
    } else {
      // New profile
      profile = await createProfile({
        email,
        country: body.country,
        persona: body.persona,
        capitalBand: body.capitalBand,
        answers: body.answers,
        payload: body.payload,
      });
    }

    // Create session token for 72-hour TTL matching (Edge Case 3)
    const sessionToken = crypto.randomUUID();
    await createSession(sessionToken, {
      persona: body.persona,
      capitalBand: body.capitalBand,
      payload: body.payload,
    });

    // Send welcome email (non-blocking — don't fail the request if email fails)
    sendWelcomeEmail({
      email,
      persona: body.persona,
      capitalBand: body.capitalBand,
      tierName: body.tierName,
    }).catch((err) => {
      console.error('[vectorRoutes] Welcome email error:', err);
    });

    res.json({
      status: 'captured',
      profileId: profile.id,
      sessionToken,
    });
  } catch (err) {
    console.error('[vectorRoutes] Capture error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/vector/keep-existing
 * Edge Case 1: User chose to keep their original profile
 */
router.post('/keep-existing', async (req: express.Request, res: express.Response): Promise<void> => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }

  try {
    const existing = await findProfileByEmail(email.trim().toLowerCase());
    if (!existing) {
      res.status(404).json({ error: 'No existing profile found' });
      return;
    }

    // Create session token for the existing profile
    const sessionToken = crypto.randomUUID();
    await createSession(sessionToken, {
      persona: existing.persona,
      capitalBand: existing.capital_band,
      payload: existing.payload as Record<string, unknown>,
    });

    res.json({
      status: 'kept_existing',
      profileId: existing.id,
      sessionToken,
    });
  } catch (err) {
    console.error('[vectorRoutes] Keep-existing error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/vector/skip
 * User skipped email capture — store session for 72-hour TTL (Edge Case 3)
 */
router.post('/skip', async (req: express.Request, res: express.Response): Promise<void> => {
  const { persona, capitalBand, payload } = req.body as {
    persona: string;
    capitalBand: string;
    payload: Record<string, unknown>;
  };

  if (!persona || !capitalBand || !payload) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const sessionToken = crypto.randomUUID();
    await createSession(sessionToken, { persona, capitalBand, payload });

    res.json({ status: 'skipped', sessionToken });
  } catch (err) {
    console.error('[vectorRoutes] Skip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up expired sessions periodically (every hour)
setInterval(() => {
  cleanExpiredSessions().catch((err) => {
    console.error('[vectorRoutes] Session cleanup error:', err);
  });
}, 60 * 60 * 1000);

export default router;
