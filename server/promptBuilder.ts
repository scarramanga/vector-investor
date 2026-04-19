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

const CALL_3_TASK_CONTEXT = `You are generating a personalised investor orientation profile for a downloadable PDF document. This document may be shared with a partner, family member, or financial adviser. It must read well as a standalone document without any surrounding app context.

Write two paragraphs.

Paragraph 1, Recognition. Write directly to this person in second person. Reference specific signals from their answers. Be warm, respectful, and affirming of what they have built or where they are in their journey. Never confrontational. Never blunt. This paragraph should make someone feel understood and respected, not challenged.

Paragraph 2, Reframe. Offer a single perspective shift that connects what they believe to something they may not have considered. Frame it as an invitation to think differently, not an instruction to act. Use language like "it may be worth considering" or "one question worth sitting with" rather than "you need to" or "you should." This paragraph should leave the reader curious, not pressured.

Length: 150 to 250 words total. No headings, no bullet points, no lists. Flowing prose. Do not mention Vector, StackMotive, or any product by name. Do not give financial advice. Do not recommend specific securities. Do not use em dashes. Do not use exclamation marks.

Remember: this document may be read by someone who did not take the quiz. It must make sense and feel respectful without any additional context.`;

export function buildSystemPrompt(type: 'profile' | 'pdf' = 'profile'): string {
  const voiceAndTone = loadVoiceAndTone();
  const taskContext = type === 'pdf' ? CALL_3_TASK_CONTEXT : CALL_1_TASK_CONTEXT;

  return `${voiceAndTone}\n\n---\n\n${taskContext}`;
}
