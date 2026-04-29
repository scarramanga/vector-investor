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
import { initDatabase, getFollowUpQueue, advanceFollowUpStatus } from './db.js';
import { lookupStackMotiveUser } from './stackmotiveApi.js';
import { getPhilosophyLabel, generatePhilosophySignalBlock } from './macroSignals.js';
import { sendEmail1TheMirror, sendEmail2TheGap, sendEmail3TheDecision } from './followupEmails.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Derive the recommended tier from persona + capital band using the same
 * mapping as the frontend tierRecommendations.ts.
 */
function getRecommendedTier(persona: string, capitalBand: string): string {
  const tierMap: Record<string, Record<string, string>> = {
    'awakening': {
      'emerging': 'Observer',
      'building': 'Observer',
      'established': 'Navigator',
      'concentrated': 'Navigator',
      'sovereign-capital': 'Navigator',
      'sovereign-concentrated': 'Navigator',
    },
    'gut-trader': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Operator',
      'concentrated': 'Operator',
      'sovereign-capital': 'Operator',
      'sovereign-concentrated': 'Operator',
    },
    'swamped-analyst': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Operator',
      'concentrated': 'Operator',
      'sovereign-capital': 'Operator',
      'sovereign-concentrated': 'Operator',
    },
    'comfortable-blind-spot': {
      'emerging': 'Navigator',
      'building': 'Navigator',
      'established': 'Navigator',
      'concentrated': 'Navigator',
      'sovereign-capital': 'Navigator',
      'sovereign-concentrated': 'Operator',
    },
  };

  return tierMap[persona]?.[capitalBand] || 'Observer';
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
    const { id, email, persona, capital_band, follow_up_status } = profile;
    const philosophy = getPhilosophyLabel(persona);
    const recommendedTier = getRecommendedTier(persona, capital_band);

    // Look up StackMotive account for tier/position enrichment
    const smUser = await lookupStackMotiveUser(email);
    const tier = smUser?.tier || recommendedTier;

    let success = false;

    if (follow_up_status === 'queued') {
      // Day 3: Email 1 -- The Mirror
      const signalBlock = await generatePhilosophySignalBlock(philosophy);
      success = await sendEmail1TheMirror({
        email,
        persona,
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
        persona,
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
        persona,
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
