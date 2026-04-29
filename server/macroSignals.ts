/**
 * Philosophy signal block generator.
 * Uses macro data from StackMotive + Claude to produce a 3-4 sentence
 * summary of what the current macro environment shows for a given philosophy.
 */

import Anthropic from '@anthropic-ai/sdk';
import { fetchMacroData } from './stackmotiveApi.js';

/**
 * Map persona to a human-readable investment philosophy label.
 */
export function getPhilosophyLabel(persona: string): string {
  const map: Record<string, string> = {
    'awakening': 'macro awareness',
    'gut-trader': 'momentum and conviction',
    'swamped-analyst': 'analytical',
    'comfortable-blind-spot': 'preservation',
  };
  return map[persona] || persona;
}

/**
 * Generate a philosophy-specific macro signal block using Claude.
 * Returns the generated text, or null if anything fails (API down, no key, etc.).
 */
export async function generatePhilosophySignalBlock(philosophy: string): Promise<string | null> {
  const apiKey = process.env['VECTOR_ANTHROPIC_API_KEY'];
  if (!apiKey) {
    console.warn('[macroSignals] VECTOR_ANTHROPIC_API_KEY not set. Skipping signal block.');
    return null;
  }

  const model = process.env['VECTOR_CLAUDE_MODEL'] || 'claude-haiku-4-5-20251001';

  let macroData;
  try {
    macroData = await fetchMacroData();
  } catch (err) {
    console.error('[macroSignals] Failed to fetch macro data:', err);
    return null;
  }

  // If all endpoints failed, skip the block
  if (!macroData.cpi && !macroData.treasury && !macroData.fiatDebasement && !macroData.cpiSeries) {
    console.warn('[macroSignals] No macro data available. Skipping signal block.');
    return null;
  }

  const systemPrompt = `You are a macro intelligence summariser for a financial education platform. 
The user has declared the following investment philosophy: ${philosophy}.
Here is the current macro data: ${JSON.stringify(macroData)}.
Summarise in three to four sentences what this data shows that is relevant to this philosophy.
Use only observable facts from the data provided. 
Do not recommend any action. 
Do not suggest buying or selling anything. 
Do not use the words: consider, should, opportunity, recommend, suggest, may want to, could be worth.
Do not make price predictions.
State only what is observable in the data.
This is educational context, not financial advice.`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create(
      {
        model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate the macro signal summary.' }],
      },
      { signal: AbortSignal.timeout(15000) },
    );

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.warn('[macroSignals] No text in Claude response.');
      return null;
    }

    return textBlock.text;
  } catch (err) {
    console.error('[macroSignals] Claude API error:', err);
    return null;
  }
}
