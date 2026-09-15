/**
 * Vector follow-up CronJob entry point.
 *
 * Runs daily at 9am NZT (21:00 UTC). Processes the follow-up queue:
 *   - queued + Day 3 due  -> Email 1 (The Mirror)
 *   - day3_sent + Day 7 due -> Email 2 (The Gap)
 *   - day7_sent + Day 14 due -> Email 3 (The Decision)
 *
 * Usage: npx tsx server/followupJob.ts
 */

import 'dotenv/config';
import { initDatabase, getFollowUpQueue, advanceFollowUpStatus, type VectorProfileRow } from './db.js';
import { lookupStackMotiveUser, type StackMotiveUser } from './stackmotiveApi.js';
import { generatePhilosophySignalBlock } from './macroSignals.js';
import { sendEmail1TheMirror, sendEmail2TheGap, sendEmail3TheDecision } from './followupEmails.js';
import { sendV2Email1, sendV2Email2, sendV2Email3, type V2EmailData } from './followupEmailsV2.js';
import { getRecommendedTier } from './tierRecommendation.js';

// GAP-267 Phase 2: v2 follow-up copy is pending approval. Until this flag is set
// truthy, v2 profiles stay queued and no v2 email is sent (v1 is unaffected).
const V2_ENABLED = /^(1|true|yes)$/i.test(process.env['VECTOR_V2_FOLLOWUP_ENABLED'] ?? '');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process one v2 profile. Returns true (sent), false (send failed), or null
 * (nothing due / unexpected status). Beginners (no themes) get the learning
 * track; the v2 senders choose the track from the data.
 */
async function processV2(
  profile: VectorProfileRow,
  smUser: StackMotiveUser | null,
): Promise<boolean | null> {
  const themes = Array.isArray(profile.philosophy_themes) ? profile.philosophy_themes.filter(Boolean) : [];
  const interests = Array.isArray(profile.exploratory_interests) ? profile.exploratory_interests.filter(Boolean) : [];
  const data: V2EmailData = {
    email: profile.email,
    philosophyThemes: themes,
    interests,
    tier: smUser?.tier || 'observer',
    smUser,
  };

  if (profile.follow_up_status === 'queued') {
    if (themes.length > 0) data.signalBlock = await generatePhilosophySignalBlock(themes[0]!);
    if (!(await sendV2Email1(data))) return false;
    await advanceFollowUpStatus(profile.id, 'day3_sent', 4);
    console.log(`[followupJob] [${profile.id}] v2 Email 1 sent to ${profile.email}. Status -> day3_sent.`);
    return true;
  }
  if (profile.follow_up_status === 'day3_sent') {
    if (!(await sendV2Email2(data))) return false;
    await advanceFollowUpStatus(profile.id, 'day7_sent', 7);
    console.log(`[followupJob] [${profile.id}] v2 Email 2 sent to ${profile.email}. Status -> day7_sent.`);
    return true;
  }
  if (profile.follow_up_status === 'day7_sent') {
    if (!(await sendV2Email3(data))) return false;
    await advanceFollowUpStatus(profile.id, 'completed', null);
    console.log(`[followupJob] [${profile.id}] v2 Email 3 sent to ${profile.email}. Status -> completed.`);
    return true;
  }
  return null;
}

async function main(): Promise<void> {
  console.log('[followupJob] Starting follow-up email processing...');

  try {
    await initDatabase();
    console.log('[followupJob] Database initialised.');
  } catch (err) {
    console.error('[followupJob] Database init failed:', err);
    process.exit(1);
  }

  const queue = await getFollowUpQueue();
  console.log(`[followupJob] ${queue.length} profile(s) due for follow-up.`);

  if (queue.length === 0) {
    console.log('[followupJob] Nothing to process. Exiting.');
    process.exit(0);
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of queue) {
    const { id, email, persona, capital_band, philosophy: rawPhilosophy, follow_up_status } = profile;

    // Look up StackMotive account for tier/position enrichment
    const smUser = await lookupStackMotiveUser(email);

    // GAP-267 Phase 2: v2 profiles carry no persona -- route them to the v2
    // (philosophy/learning) copy, gated on the enable flag until copy is approved.
    if (profile.profile_version === 'v2') {
      if (!V2_ENABLED) {
        skipped++;
        console.log(`[followupJob] [${id}] v2 profile held (VECTOR_V2_FOLLOWUP_ENABLED off).`);
        continue;
      }
      const v2ok = await processV2(profile, smUser);
      if (v2ok) sent++; else if (v2ok === false) failed++; else skipped++;
      await sleep(600);
      continue;
    }

    const philosophy = rawPhilosophy || persona || '';
    const personaStr = persona ?? '';
    const recommendedTier = getRecommendedTier(persona ?? '', capital_band ?? '');
    const tier = smUser?.tier || recommendedTier;

    let success = false;

    if (follow_up_status === 'queued') {
      // Day 3: Email 1 -- The Mirror
      const signalBlock = await generatePhilosophySignalBlock(philosophy);
      success = await sendEmail1TheMirror({
        email,
        persona: personaStr,
        philosophy,
        tier,
        signalBlock,
      });

      if (success) {
        await advanceFollowUpStatus(id, 'day3_sent', 4);
        sent++;
        console.log(`[followupJob] [${id}] Email 1 sent to ${email}. Status -> day3_sent.`);
      } else {
        failed++;
        console.error(`[followupJob] [${id}] Email 1 failed for ${email}. Status unchanged.`);
      }
    } else if (follow_up_status === 'day3_sent') {
      // Day 7: Email 2 -- The Gap
      success = await sendEmail2TheGap({
        email,
        persona: personaStr,
        philosophy,
        tier,
        smUser,
      });

      if (success) {
        await advanceFollowUpStatus(id, 'day7_sent', 7);
        sent++;
        console.log(`[followupJob] [${id}] Email 2 sent to ${email}. Status -> day7_sent.`);
      } else {
        failed++;
        console.error(`[followupJob] [${id}] Email 2 failed for ${email}. Status unchanged.`);
      }
    } else if (follow_up_status === 'day7_sent') {
      // Day 14: Email 3 -- The Decision
      success = await sendEmail3TheDecision({
        email,
        persona: personaStr,
        philosophy,
        tier,
        smUser,
      });

      if (success) {
        await advanceFollowUpStatus(id, 'completed', null);
        sent++;
        console.log(`[followupJob] [${id}] Email 3 sent to ${email}. Status -> completed.`);
      } else {
        failed++;
        console.error(`[followupJob] [${id}] Email 3 failed for ${email}. Status unchanged.`);
      }
    } else {
      skipped++;
      console.warn(`[followupJob] [${id}] Unexpected status "${follow_up_status}". Skipping.`);
    }

    // Rate limit: 0.6s between sends
    await sleep(600);
  }

  console.log(`[followupJob] Done. Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[followupJob] Unhandled error:', err);
  process.exit(1);
});
