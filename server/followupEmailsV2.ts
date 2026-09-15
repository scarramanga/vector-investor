/**
 * GAP-267 Phase 2 -- follow-up emails for v2 questionnaire profiles.
 *
 * v2 profiles carry no persona. Two tracks, chosen per profile:
 *   - EXPERIENCED (declared >= 1 philosophy theme): a philosophy-anchored
 *     nurture with the macro signal block, mirroring the v1 Mirror/Gap/Decision.
 *   - BEGINNER (no philosophy, has learning interests): a learning-path nurture
 *     that points back into StackMotive's guided path. Never a philosophy pitch,
 *     never pressure to deploy capital.
 *
 * DRAFT COPY -- pending Andy's approval before v2 sends are enabled
 * (VECTOR_V2_FOLLOWUP_ENABLED). The voice matches followupEmails.ts.
 */

import { buildUnsubscribeUrl } from './unsubscribe.js';
import type { StackMotiveUser } from './stackmotiveApi.js';
import { getResend, wrapHtml, p, ctaButton, signoff, SENDER, BCC } from './followupEmails.js';

export interface V2EmailData {
  email: string;
  philosophyThemes: string[];
  interests: string[];
  tier: string;
  smUser: StackMotiveUser | null;
  signalBlock?: string | null;
}

function humanList(items: string[]): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0]!;
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`;
}

function isExperienced(data: V2EmailData): boolean {
  return (data.philosophyThemes?.filter(Boolean).length ?? 0) > 0;
}

async function send(to: string, subject: string, body: string): Promise<boolean> {
  const client = getResend();
  if (!client) return false;
  try {
    await client.emails.send({ from: SENDER, to: [to], bcc: [BCC], subject, html: wrapHtml(body) });
    console.log(`[followup-v2] "${subject}" sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[followup-v2] "${subject}" failed for ${to}:`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// EMAIL 1 -- Day 3
// ---------------------------------------------------------------------------

export async function sendV2Email1(data: V2EmailData): Promise<boolean> {
  const unsub = buildUnsubscribeUrl(data.email);

  if (isExperienced(data)) {
    const themes = humanList(data.philosophyThemes);
    let signalHtml = '';
    if (data.signalBlock) {
      signalHtml = `<div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0;">${data.signalBlock.replace(/\n/g, '<br/>')}</p>
      </div>`;
    }
    const body = `
      ${p(`You completed Vector three days ago. You described how you invest, and it came through clearly: ${themes}.`)}
      ${p('That says something specific about how you read markets. You are not chasing the next hot stock. You are watching for the structural signals -- the things that tend to move before prices do.')}
      ${p('Here is what those signals are showing right now.')}
      ${signalHtml}
      ${p('This is the kind of intelligence StackMotive surfaces every morning, filtered to the way you think. Not a firehose. Not generic market news. The specific signals that matter to your approach.')}
      ${ctaButton('Explore StackMotive')}
      ${p('You can reply to this email if you have questions. It comes to me directly.')}
      ${signoff(unsub)}
    `;
    return send(data.email, 'What the macro data is saying right now', body);
  }

  // Beginner track
  const interests = humanList(data.interests);
  const interestLine = interests
    ? `and you told us you wanted to learn about ${interests}.`
    : 'and you are still finding your feet. That is a fine place to start.';
  const body = `
    ${p(`You came through Vector three days ago as someone who is still building their approach -- ${interestLine}`)}
    ${p('There is no rush to pick a philosophy or put money to work before it is clear to you. Understanding comes first.')}
    ${p('StackMotive has a short guided learning path built around exactly the topics you picked. Plain explanations, worked examples, no jargon -- so you build your own view before you build a portfolio.')}
    ${ctaButton('Start your learning path')}
    ${p('Reply to this email with anything you are stuck on. It comes to me directly, and there is no such thing as a question that is too basic.')}
    ${signoff(unsub)}
  `;
  return send(data.email, 'A place to start', body);
}

// ---------------------------------------------------------------------------
// EMAIL 2 -- Day 7
// ---------------------------------------------------------------------------

export async function sendV2Email2(data: V2EmailData): Promise<boolean> {
  const unsub = buildUnsubscribeUrl(data.email);

  if (isExperienced(data)) {
    const themes = humanList(data.philosophyThemes);
    let body: string;
    if (!data.smUser) {
      body = `
        ${p(`A week ago you set out your approach on Vector: ${themes}.`)}
        ${p('Most people who invest this way are already tracking some of it manually. A few sources in the morning, a mental model of where things stand. It works, until it does not.')}
        ${p('The gap is not information -- you have enough of that. The gap is synthesis: taking the macro signals and asking what they mean for your specific positions, through your own approach, before markets open.')}
        ${p('That is what StackMotive does. Holdings load five ways -- a quick chat with Stack AI, a CSV, a screenshot, an IBKR connection, or manual entry. Most people are done in under five minutes, and the morning briefing runs from there.')}
        ${ctaButton('Explore StackMotive')}
        ${signoff(unsub)}
      `;
    } else if (!data.smUser.has_positions) {
      body = `
        ${p(`A week ago you set out your approach on Vector (${themes}) and signed up for StackMotive.`)}
        ${p('The platform cannot do its job until your holdings are in it -- not about features, about seeing your complete picture in one place, filtered to the way you invest.')}
        ${p('Holdings load five ways -- Stack AI chat, CSV, screenshot, IBKR, or manual entry. Under five minutes, and your morning briefing runs every day before markets open.')}
        ${signoff(unsub)}
      `;
    } else {
      body = `
        ${p(`A week ago you mapped your approach on Vector and you are now on StackMotive with positions loaded.`)}
        ${p('The alert system removes the need to watch the market constantly -- price moves, volume spikes, confluence signals, stop-loss triggers. Set your parameters, the platform watches.')}
        ${signoff(unsub)}
      `;
    }
    return send(data.email, 'The signals you are not seeing yet', body);
  }

  // Beginner track
  const interests = humanList(data.interests);
  const topicLine = interests ? `starting with ${interests}` : 'starting with the basics';
  const body = `
    ${p('A week ago you started learning with Vector. This is the follow-through.')}
    ${p(`The guided path in StackMotive picks up where you left off, ${topicLine}. It is built to be read in a few minutes at a time -- one idea, a worked example, a small next step.`)}
    ${p('You do not need a portfolio to use it. The point is to understand how markets work first, so that when you do invest, it is a decision you can explain.')}
    ${ctaButton('Continue your learning path')}
    ${signoff(unsub)}
  `;
  return send(data.email, 'Picking up where you left off', body);
}

// ---------------------------------------------------------------------------
// EMAIL 3 -- Day 14
// ---------------------------------------------------------------------------

export async function sendV2Email3(data: V2EmailData): Promise<boolean> {
  const unsub = buildUnsubscribeUrl(data.email);

  if (isExperienced(data)) {
    let body: string;
    if (!data.smUser) {
      body = `
        ${p('Two weeks since you completed Vector.')}
        ${p('Your profile is still there, and the intelligence it maps to is running every day.')}
        ${p('One direct question: what is in the way?')}
        ${p('If it is time, Stack AI can load your portfolio in a five-minute conversation. If it is uncertainty about whether StackMotive fits how you invest, reply to this email and I will give you an honest answer -- not a sales pitch. If it is not right for you, I will tell you that too.')}
        ${p('The platform will be here when you are ready.')}
        ${signoff(unsub)}
      `;
    } else if (!data.smUser.has_positions) {
      body = `
        ${p('Two weeks since you completed Vector. Two weeks on StackMotive without a portfolio loaded.')}
        ${p('I am not going to send you another feature list. One direct question: what is in the way?')}
        ${p('If it is time, Stack AI can do it in five minutes. If it is uncertainty about fit, reply and I will give you an honest answer.')}
        ${p('The platform will be here when you are ready.')}
        ${signoff(unsub)}
      `;
    } else {
      body = `
        ${p('Two weeks since you completed Vector. Your positions are in and your briefings are running.')}
        ${p('The next thing worth your attention is the strategy layer -- DCA rules, stop-loss triggers, take-profit levels, written into the platform so the rules hold when markets move and emotion says override them.')}
        ${p('It is in the sidebar under Strategies. It is the feature I am most proud of.')}
        ${signoff(unsub)}
      `;
    }
    return send(data.email, 'A direct question', body);
  }

  // Beginner track
  const body = `
    ${p('Two weeks since you started learning with Vector.')}
    ${p('No pitch here. Learning to invest well is a slow build, and starting before you are ready is how people lose money they did not need to lose.')}
    ${p('The guided path is there whenever you want to keep going, one topic at a time. And when a philosophy does start to feel like yours, StackMotive is ready to build around it -- but only then, and only if you want to.')}
    ${p('If a question comes up as you learn, reply to this email. It comes to me directly.')}
    ${signoff(unsub)}
  `;
  return send(data.email, 'Still here when you are ready', body);
}
