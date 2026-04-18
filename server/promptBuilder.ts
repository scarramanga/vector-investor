import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let voiceAndToneCache: string | null = null;

function loadVoiceAndTone(): string {
  if (voiceAndToneCache) return voiceAndToneCache;

  const filePath = path.resolve(__dirname, '..', 'src', 'config', 'voice-and-tone.md');
  try {
    voiceAndToneCache = fs.readFileSync(filePath, 'utf-8');
  } catch {
    console.warn('[promptBuilder] Could not load voice-and-tone.md from', filePath);
    voiceAndToneCache = '';
  }
  return voiceAndToneCache;
}

const CALL_1_TASK_CONTEXT = `You are generating a personalised investor orientation profile for Vector by Sovereign Signal. You have received the user's complete answer set across 13 questions, their classified persona, and their capital band.

Your task: write two paragraphs.

Paragraph 1, Recognition. Write directly to this person in second person. Reference specific signals from their answers, not generically, but in a way that makes them feel seen. If they answered Q5 with A (the index fund default feels right) but Q2 with B (the old playbook might not work), surface that tension. If their Q10 shows inaction but Q11 shows thesis-driven conviction, name that gap. The recognition paragraph should make the reader feel understood, not categorised.

Paragraph 2, Reframe. Based on their specific combination of answers, offer the single most relevant lens shift. Not a lecture. Not a list. One idea that connects what they believe to what they have not yet considered. This should feel like the most useful thing anyone has ever said to them about their financial position.

Length: 150 to 250 words total across both paragraphs. No more. Do not use headings, bullet points, or lists. Write in flowing prose. Do not mention Vector, StackMotive, or any product by name. Do not give financial advice. Do not recommend specific securities. Do not use em dashes.`;

const CALL_2_TASK_CONTEXT = `You are generating a personalised one-sentence thesis for each instrument in a conviction theme within Vector by Sovereign Signal. You have received the user's answer set, persona, capital band, and the theme with its instruments.

For each instrument provided, write exactly one sentence explaining why this instrument is relevant to someone with this specific worldview and situation. Reference their answers where natural, including their time horizon, conviction driver, and macro awareness level. Each sentence should feel like it was written for this person, not copied from a brochure.

Return the output as a JSON object with ticker symbols as keys and thesis sentences as values. Do not give financial advice. Do not recommend buying anything. Frame everything as "someone who thinks this way might find it useful to understand..." Do not use em dashes. Do not use exclamation marks. Plain language throughout.

Return ONLY the JSON object, no markdown fences, no additional text.`;

export function buildSystemPrompt(type: 'profile' | 'discovery'): string {
  const voiceAndTone = loadVoiceAndTone();
  const taskContext = type === 'profile' ? CALL_1_TASK_CONTEXT : CALL_2_TASK_CONTEXT;

  return `${voiceAndTone}\n\n---\n\n${taskContext}`;
}
