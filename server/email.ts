import { Resend } from 'resend';
import { buildUnsubscribeUrl } from './unsubscribe.js';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend) {
    const apiKey = process.env['VECTOR_RESEND_API_KEY'];
    if (!apiKey) {
      console.warn('[email] VECTOR_RESEND_API_KEY is not set. Emails will not be sent.');
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

function capitalBandLabel(band: string): string {
  const labels: Record<string, string> = {
    'emerging': 'Emerging',
    'building': 'Building',
    'established': 'Established',
    'concentrated': 'Concentrated',
    'sovereign-capital': 'Sovereign Capital',
    'sovereign-concentrated': 'Sovereign — Concentrated',
  };
  return labels[band] || band;
}

export async function sendWelcomeEmail(data: {
  email: string;
  persona: string;
  capitalBand: string;
  tierName: string;
}): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.warn('[email] Resend not configured — skipping welcome email');
    return false;
  }

  const personaLabel = formatPersonaLabel(data.persona);
  const bandLabel = capitalBandLabel(data.capitalBand);
  const unsubscribeUrl = buildUnsubscribeUrl(data.email);

  try {
    await client.emails.send({
      from: 'Vector by Sovereign Signal <vector@sovereignassets.org>',
      to: [data.email],
      bcc: ['andy@sovereignassets.org'],
      subject: `Your Vector Profile: ${personaLabel}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Your Vector Profile</h1>
          <p style="font-size: 14px; color: #666; margin-bottom: 32px;">Vector by Sovereign Signal</p>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 12px;">INVESTOR PROFILE SUMMARY</p>
            <p style="font-size: 16px; margin-bottom: 4px;"><strong>Profile:</strong> ${personaLabel}</p>
            <p style="font-size: 16px; margin-bottom: 4px;"><strong>Capital Position:</strong> ${bandLabel}</p>
            <p style="font-size: 16px;"><strong>Recommended Tier:</strong> ${data.tierName}</p>
          </div>

          <p style="font-size: 15px; line-height: 1.7; color: #333; margin-bottom: 16px;">
            Thank you for completing Vector. Your profile report is attached to this email or available for download on the results screen.
          </p>

          <p style="font-size: 15px; line-height: 1.7; color: #333; margin-bottom: 16px;">
            Based on your profile, <strong>${data.tierName}</strong> is your starting point on StackMotive. Each day you can preview the next tier up for free — starting at 5 minutes, growing by a minute each consecutive day you use it. If you want full access to a higher tier for the rest of this month, you can unlock it for 10% of the monthly price. No subscription change required.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://www.stackmotiveapp.com" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #fff; background-color: #6366f1; border-radius: 8px; text-decoration: none;">
              Start on ${data.tierName}
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />

          <p style="font-size: 12px; color: #999; line-height: 1.6;">
            Vector is an educational and orientation tool. Nothing in this email constitutes financial advice.
          </p>
          <p style="font-size: 12px; color: #999;">
            You are receiving this because you completed the Vector investor orientation quiz. To unsubscribe, <a href="${unsubscribeUrl}" style="color: #999;">click here</a> or reply to this email with "unsubscribe".
          </p>
        </div>
      `,
    });

    console.log(`[email] Welcome email sent to ${data.email}`);
    return true;
  } catch (err) {
    console.error('[email] Failed to send welcome email:', err);
    return false;
  }
}
