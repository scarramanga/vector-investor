/**
 * Follow-up email templates for the Vector three-email sequence.
 *
 * Email 1 (Day 3): The Mirror -- macro signal block + tier CTA
 * Email 2 (Day 7): The Gap -- three variants based on StackMotive status
 * Email 3 (Day 14): The Decision -- three variants based on StackMotive status
 */

import { Resend } from 'resend';
import { buildUnsubscribeUrl } from './unsubscribe.js';
import type { StackMotiveUser } from './stackmotiveApi.js';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend) {
    const apiKey = process.env['VECTOR_RESEND_API_KEY'];
    if (!apiKey) {
      console.warn('[followupEmails] VECTOR_RESEND_API_KEY is not set.');
      return null;
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

function formatPersonaLabel(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const SENDER = 'Vector by Sovereign Signal <vector@sovereignassets.org>';
const BCC = 'andy@sovereignassets.org';

function emailFooter(unsubscribeUrl: string): string {
  return `
    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
    <p style="font-size: 12px; color: #999; line-height: 1.6;">
      Vector is an educational and orientation tool. Nothing in this email constitutes financial advice.
    </p>
    <p style="font-size: 12px; color: #999; line-height: 1.6;">
      You are receiving this because you completed the Vector investor orientation quiz. To unsubscribe, <a href="${unsubscribeUrl}" style="color: #999;">click here</a> or reply to this email with "unsubscribe".
    </p>`;
}

function wrapHtml(body: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e;">${body}</div>`;
}

function ctaButton(label: string): string {
  return `<div style="text-align: center; margin: 32px 0;">
    <a href="https://www.stackmotiveapp.com" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #fff; background-color: #6366f1; border-radius: 8px; text-decoration: none;">
      ${label}
    </a>
  </div>`;
}

function p(text: string): string {
  return `<p style="font-size: 15px; line-height: 1.7; color: #333; margin-bottom: 16px;">${text}</p>`;
}

function signoff(unsubscribeUrl: string): string {
  return `${p('Andy<br/>Sovereign Assets')}${emailFooter(unsubscribeUrl)}`;
}

// ---------------------------------------------------------------------------
// EMAIL 1 -- THE MIRROR (Day 3)
// ---------------------------------------------------------------------------

export async function sendEmail1TheMirror(data: {
  email: string;
  persona: string;
  philosophy: string;
  tier: string;
  signalBlock: string | null;
}): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const personaLabel = formatPersonaLabel(data.persona);
  const unsubscribeUrl = buildUnsubscribeUrl(data.email);

  let signalHtml = '';
  if (data.signalBlock) {
    signalHtml = `<div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
      <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0;">${data.signalBlock.replace(/\n/g, '<br/>')}</p>
    </div>`;
  }

  const html = wrapHtml(`
    ${p(`You completed Vector three days ago. Your profile came back as ${personaLabel} with a ${data.philosophy} lens.`)}
    ${p('That means something specific about how you see markets. You are not looking for the next hot stock. You are watching for the structural signals -- the things that move before prices do.')}
    ${p('Here is what those signals are showing right now.')}
    ${signalHtml}
    ${p('This is the kind of intelligence StackMotive surfaces every morning, filtered to your philosophy. Not a firehose. Not generic market news. The specific signals that matter to the way you think.')}
    ${p(`If you want to see it in context of your own holdings, your starting point on StackMotive is ${data.tier}.`)}
    ${ctaButton(`Start on ${data.tier}`)}
    ${p('You can also reply to this email if you have questions. It comes to me directly.')}
    ${signoff(unsubscribeUrl)}
  `);

  try {
    await client.emails.send({
      from: SENDER,
      to: [data.email],
      bcc: [BCC],
      subject: 'What the macro data is saying right now',
      html,
    });
    console.log(`[followup] Email 1 (The Mirror) sent to ${data.email}`);
    return true;
  } catch (err) {
    console.error(`[followup] Email 1 failed for ${data.email}:`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// EMAIL 2 -- THE GAP (Day 7)
// ---------------------------------------------------------------------------

export async function sendEmail2TheGap(data: {
  email: string;
  persona: string;
  philosophy: string;
  tier: string;
  smUser: StackMotiveUser | null;
}): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const personaLabel = formatPersonaLabel(data.persona);
  const unsubscribeUrl = buildUnsubscribeUrl(data.email);
  let body: string;

  if (!data.smUser) {
    // No StackMotive account
    body = `
      ${p(`A week ago you mapped as ${personaLabel}. You have a ${data.philosophy} lens on markets.`)}
      ${p('Most people with that profile are already tracking some of this manually. Checking a few sources in the morning. Keeping a mental model of where things are. It works, until it does not.')}
      ${p('The gap is not information. You have enough of that. The gap is synthesis. Taking macro signals and asking what they mean for your specific positions, through your specific philosophy, before markets open.')}
      ${p('That is what StackMotive does.')}
      ${p('Your holdings can be loaded five ways. Stack AI conversation -- just tell it what you hold. Sharesies CSV export. A screenshot of your portfolio. IBKR direct connection. Manual entry. Most people are done in under five minutes.')}
      ${p('Once your positions are in, your morning briefing runs every day before markets open. You check it once. You know what matters. You get on with your day.')}
      ${ctaButton(`Start on ${data.tier}`)}
      ${signoff(unsubscribeUrl)}
    `;
  } else if (!data.smUser.has_positions) {
    // StackMotive account, no positions
    body = `
      ${p(`A week ago you mapped as ${personaLabel} on Vector. You are on ${data.smUser.tier} on StackMotive.`)}
      ${p(`The platform cannot do its job until your holdings are in it. It is not about features -- it is about seeing your complete picture in one place, filtered through your ${data.philosophy} lens.`)}
      ${p('Your holdings can be loaded five ways. Stack AI conversation -- just tell it what you hold. Sharesies CSV export. A screenshot of your portfolio. IBKR direct connection. Manual entry. Most people are done in under five minutes.')}
      ${p('Once your positions are in, your morning briefing runs every day before markets open. You check it once. You know what matters. You get on with your day.')}
      ${signoff(unsubscribeUrl)}
    `;
  } else {
    // StackMotive account, has positions
    body = `
      ${p(`A week ago you mapped as ${personaLabel} on Vector. You are on ${data.smUser.tier} on StackMotive with positions loaded.`)}
      ${p('The alert system removes the need to watch the market constantly. Price movements, volume spikes, confluence signals, stop loss triggers. Set your parameters, the platform watches.')}
      ${p('Each day you can preview the next tier up for free -- starting at 5 minutes, growing by a minute each consecutive day you use it. If you want full access to a higher tier for the rest of this month, you can unlock it for 10% of the monthly price. No subscription change required.')}
      ${signoff(unsubscribeUrl)}
    `;
  }

  const html = wrapHtml(body);

  try {
    await client.emails.send({
      from: SENDER,
      to: [data.email],
      bcc: [BCC],
      subject: 'The signals you are not seeing yet',
      html,
    });
    console.log(`[followup] Email 2 (The Gap) sent to ${data.email}`);
    return true;
  } catch (err) {
    console.error(`[followup] Email 2 failed for ${data.email}:`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// EMAIL 3 -- THE DECISION (Day 14)
// ---------------------------------------------------------------------------

export async function sendEmail3TheDecision(data: {
  email: string;
  persona: string;
  philosophy: string;
  tier: string;
  smUser: StackMotiveUser | null;
}): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const personaLabel = formatPersonaLabel(data.persona);
  const unsubscribeUrl = buildUnsubscribeUrl(data.email);
  let body: string;

  if (!data.smUser) {
    // No StackMotive account
    body = `
      ${p('Two weeks since you completed Vector.')}
      ${p(`Your profile is still there. ${personaLabel}, ${data.philosophy} lens, ${data.tier} as your starting point. The intelligence it maps to is running every day.`)}
      ${p('One direct question: what is in the way?')}
      ${p('If it is time, Stack AI can load your portfolio in a conversation. Five minutes. You tell it what you hold, it does the rest.')}
      ${p('If it is uncertainty about whether StackMotive is the right fit for how you invest, reply to this email and I will give you an honest answer. Not a sales pitch. If it is not right for you I will tell you that too.')}
      ${p('The platform will be here when you are ready.')}
      ${signoff(unsubscribeUrl)}
    `;
  } else if (!data.smUser.has_positions) {
    // StackMotive account, no positions
    body = `
      ${p('Two weeks since you completed Vector. Two weeks on StackMotive without a portfolio loaded.')}
      ${p('I am not going to send you another feature list.')}
      ${p('One direct question: what is in the way?')}
      ${p('If it is time, Stack AI can do it in five minutes. You tell it what you hold, it does the rest.')}
      ${p('If it is uncertainty about fit, reply and I will give you an honest answer.')}
      ${p('The platform will be here when you are ready.')}
      ${signoff(unsubscribeUrl)}
    `;
  } else {
    // StackMotive account, has positions
    body = `
      ${p('Two weeks since you completed Vector. Your positions are in and your briefings are running.')}
      ${p('The next thing worth your attention is the strategy layer. DCA rules, stop loss triggers, take profit levels -- written into the platform so the rules hold when markets move and emotion tells you to override them.')}
      ${p('It is in the sidebar under Strategies. It is the feature I am most proud of.')}
      ${signoff(unsubscribeUrl)}
    `;
  }

  const html = wrapHtml(body);

  try {
    await client.emails.send({
      from: SENDER,
      to: [data.email],
      bcc: [BCC],
      subject: 'A direct question',
      html,
    });
    console.log(`[followup] Email 3 (The Decision) sent to ${data.email}`);
    return true;
  } catch (err) {
    console.error(`[followup] Email 3 failed for ${data.email}:`, err);
    return false;
  }
}
