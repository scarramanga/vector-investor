import express from 'express';
import { findProfileByEmail, createProfile, replaceProfile, createSession, cleanExpiredSessions, unsubscribeByEmail } from './db.js';
import { sendWelcomeEmail } from './email.js';
import { ingestVectorProfile } from './stackmotiveApi.js';
import { getRecommendedTier } from './tierRecommendation.js';
import { verifyUnsubscribeToken } from './unsubscribe.js';
import crypto from 'node:crypto';

const router = express.Router();

interface CaptureRequest {
  email: string;
  country: string | null;
  persona: string;
  capitalBand: string;
  philosophy: string | null;
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
        philosophy: body.philosophy,
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
        philosophy: body.philosophy,
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

    // Ingest profile into StackMotive (non-blocking — don't fail the capture response)
    ingestVectorProfile({
      email,
      vector_persona: body.persona,
      vector_capital_band: body.capitalBand,
      vector_philosophy: body.philosophy ?? null,
      vector_recommended_tier: body.tierName,
      vector_country: body.country ?? null,
      vector_time_horizon: body.payload['timeHorizon'] as string,
      vector_friction_point: body.payload['frictionPoint'] as string,
      vector_desired_outcome: body.payload['desiredOutcome'] as string,
      vector_macro_awareness: body.payload['macroAwareness'] as string,
      vector_action_history: body.payload['actionHistory'] as string,
      vector_conviction_driver: body.payload['convictionDriver'] as string,
      vector_life_stage: body.payload['lifeStage'] as string,
      vector_adviser_managed: body.payload['adviserManaged'] as boolean,
    }).catch((err) => {
      console.error('[vectorRoutes] Ingest error:', err);
    });

    // Send welcome email with PDF attachment (non-blocking — don't fail the request if email fails)
    sendWelcomeEmail({
      email,
      persona: body.persona,
      capitalBand: body.capitalBand,
      tierName: body.tierName,
      payload: body.payload,
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
      payload: existing.payload,
    });

    // Defect 82: re-ingest the kept profile into StackMotive (non-blocking —
    // mirrors the /capture ingest, built from the existing profile row).
    // vector_recommended_tier is not stored on the row; derive it from
    // persona + capital band via the shared getRecommendedTier map.
    ingestVectorProfile({
      email: existing.email,
      vector_persona: existing.persona,
      vector_capital_band: existing.capital_band,
      vector_philosophy: existing.philosophy ?? null,
      vector_recommended_tier: getRecommendedTier(existing.persona, existing.capital_band),
      vector_country: existing.country ?? null,
      vector_time_horizon: existing.payload['timeHorizon'] as string,
      vector_friction_point: existing.payload['frictionPoint'] as string,
      vector_desired_outcome: existing.payload['desiredOutcome'] as string,
      vector_macro_awareness: existing.payload['macroAwareness'] as string,
      vector_action_history: existing.payload['actionHistory'] as string,
      vector_conviction_driver: existing.payload['convictionDriver'] as string,
      vector_life_stage: existing.payload['lifeStage'] as string,
      vector_adviser_managed: existing.payload['adviserManaged'] as boolean,
    }).catch((err) => {
      console.error('[vectorRoutes] Ingest error:', err);
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
 * GET /api/vector/unsubscribe?token=<signed-token>
 * Verifies the HMAC-signed token and marks the user as unsubscribed.
 * Returns a simple HTML confirmation page.
 */
router.get('/unsubscribe', async (req: express.Request, res: express.Response): Promise<void> => {
  const token = req.query['token'] as string | undefined;

  if (!token) {
    res.status(400).send(unsubscribePage('Invalid unsubscribe link.'));
    return;
  }

  try {
    const email = verifyUnsubscribeToken(token);
    if (!email) {
      res.status(400).send(unsubscribePage('Invalid or expired unsubscribe link.'));
      return;
    }

    const updated = await unsubscribeByEmail(email);
    if (updated) {
      console.log(`[vectorRoutes] Unsubscribed: ${email}`);
      res.send(unsubscribePage('You have been unsubscribed. You will not receive any further follow-up emails from Vector.'));
    } else {
      res.send(unsubscribePage('No active subscription found for this email. You may have already unsubscribed.'));
    }
  } catch (err) {
    console.error('[vectorRoutes] Unsubscribe error:', err);
    res.status(500).send(unsubscribePage('Something went wrong. Please try again later.'));
  }
});

function unsubscribePage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vector - Unsubscribe</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f8f9fa;color:#1a1a2e;}div{max-width:480px;text-align:center;padding:40px 24px;}h1{font-size:20px;margin-bottom:16px;}p{font-size:15px;line-height:1.6;color:#555;}</style>
</head>
<body><div><h1>Vector by Sovereign Signal</h1><p>${message}</p></div></body>
</html>`;
}

// Clean up expired sessions periodically (every hour)
setInterval(() => {
  cleanExpiredSessions().catch((err) => {
    console.error('[vectorRoutes] Session cleanup error:', err);
  });
}, 60 * 60 * 1000);

export default router;
