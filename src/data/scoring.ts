import type { Answer, PersonaType, CapitalBand, VectorProfile } from '../types';
import type { VectorAnswerPayload, TimeHorizon, MacroAwareness, ActionHistory, ConvictionDriver, LifeStage, AnswerLetter } from '../types/vector';

const PERSONA_WEIGHTS: Record<PersonaType, number> = {
  'awakening': 0,
  'gut-trader': 0,
  'swamped-analyst': 0,
  'comfortable-blind-spot': 0
};

const CAPITAL_WEIGHTS: Record<CapitalBand, number> = {
  'emerging': 0,
  'building': 0,
  'established': 0,
  'concentrated': 0,
  'sovereign-capital': 0,
  'sovereign-concentrated': 0
};

export function calculateProfile(answers: Answer[]): VectorProfile {
  const personaScores = { ...PERSONA_WEIGHTS };
  const capitalScores = { ...CAPITAL_WEIGHTS };

  answers.forEach(answer => {
    if (answer.personaSignal) {
      personaScores[answer.personaSignal]++;
    }
    if (answer.capitalSignal) {
      capitalScores[answer.capitalSignal]++;
    }
  });

  // Determine dominant persona
  const persona = (Object.entries(personaScores)
    .sort(([, a], [, b]) => b - a)[0][0]) as PersonaType;

  // Determine capital band
  // Q6-D (illiquid wealth) is the Concentrated signal — override Q3 regardless
  let capitalBand: CapitalBand;
  const q6Answer = answers.find(a => a.questionId === 6);
  const q6IsD = q6Answer?.selectedLetter === 'D';

  if (q6IsD) {
    // Q6-D (illiquid wealth) always produces Concentrated or Sovereign-Concentrated
    // This overrides the standard score-counting logic regardless of Q3 answer
    const q3Answer = answers.find(a => a.questionId === 3);
    const q3IsConcentrated = q3Answer?.capitalSignal === 'concentrated';
    capitalBand = q3IsConcentrated ? 'sovereign-concentrated' : 'concentrated';
  } else {
    // Standard scoring: Concentrated + high capital signals = sovereign-concentrated
    const isConcentrated = capitalScores['concentrated'] >= 2;
    const isEstablishedPlus = capitalScores['established'] >= 1 || capitalScores['concentrated'] >= 1;

    if (isConcentrated && isEstablishedPlus) {
      capitalBand = 'sovereign-concentrated';
    } else {
      capitalBand = (Object.entries(capitalScores)
        .filter(([key]) => key !== 'sovereign-concentrated' && key !== 'sovereign-capital')
        .sort(([, a], [, b]) => b - a)[0][0]) as CapitalBand;
    }
  }

  return { persona, capitalBand, answers };
}

const TIME_HORIZON_MAP: Record<AnswerLetter, TimeHorizon> = {
  A: 'long',
  B: 'medium',
  C: 'short',
  D: 'undefined',
  E: 'undefined',
};

const MACRO_AWARENESS_MAP: Record<AnswerLetter, MacroAwareness> = {
  A: 'high',
  B: 'moderate',
  C: 'low',
  D: 'none',
  E: 'none',
};

const ACTION_HISTORY_MAP: Record<AnswerLetter, ActionHistory> = {
  A: 'inactive',
  B: 'active',
  C: 'research_only',
  D: 'new',
  E: 'adviser_managed',
};

const CONVICTION_DRIVER_MAP: Record<AnswerLetter, ConvictionDriver> = {
  A: 'social',
  B: 'thesis',
  C: 'analysis',
  D: 'instinct',
  E: 'adviser_led',
};

const LIFE_STAGE_MAP: Record<AnswerLetter, LifeStage> = {
  A: 'early_career',
  B: 'mid_career',
  C: 'established',
  D: 'preservation',
  E: 'established',
};

const FRICTION_POINT_LABELS: Record<AnswerLetter, string> = {
  A: 'Knowledge gap is the primary blocker',
  B: 'Has conviction but no clear vehicle or starting point',
  C: 'Time and complexity crowd out action',
  D: 'No perceived urgency to change',
  E: 'No perceived urgency to change',
};

const DESIRED_OUTCOME_LABELS: Record<AnswerLetter, string> = {
  A: 'Wants a clear starting point',
  B: 'Wants a framework for thinking about money',
  C: 'Wants confirmation that current approach is sound',
  D: 'Wants perspective on how their situation maps to a coherent philosophy',
  E: 'Wants perspective on how their situation maps to a coherent philosophy',
};

export function buildAnswerPayload(profile: VectorProfile): VectorAnswerPayload {
  const answerRecord: Record<string, AnswerLetter> = {};
  profile.answers.forEach((a) => {
    answerRecord[`q${a.questionId}`] = a.selectedLetter;
  });

  const q7 = answerRecord['q7'] as AnswerLetter;
  const q8 = answerRecord['q8'] as AnswerLetter;
  const q9 = answerRecord['q9'] as AnswerLetter;
  const q10 = answerRecord['q10'] as AnswerLetter;
  const q11 = answerRecord['q11'] as AnswerLetter;
  const q12 = answerRecord['q12'] as AnswerLetter;
  const q13 = answerRecord['q13'] as AnswerLetter;

  return {
    answers: answerRecord as VectorAnswerPayload['answers'],
    persona: profile.persona,
    capitalBand: profile.capitalBand,
    timeHorizon: TIME_HORIZON_MAP[q8],
    frictionPoint: FRICTION_POINT_LABELS[q12],
    desiredOutcome: DESIRED_OUTCOME_LABELS[q13],
    macroAwareness: MACRO_AWARENESS_MAP[q9],
    actionHistory: ACTION_HISTORY_MAP[q10],
    convictionDriver: CONVICTION_DRIVER_MAP[q11],
    lifeStage: LIFE_STAGE_MAP[q7],
    adviserManaged: q10 === 'E' || q11 === 'E',
  };
}

// ---------------------------------------------------------------------------
// Independent philosophy scoring
// ---------------------------------------------------------------------------

type PhilosophyScores = Record<string, number>;

const PHILOSOPHIES = [
  'Capital Preservation',
  'Value and Patience',
  'Rules-Based Systematic',
  'Macro and Hard Assets',
  'Disruptive Growth',
] as const;

const ZERO_SCORES: PhilosophyScores = {
  'Capital Preservation': 0,
  'Value and Patience': 0,
  'Rules-Based Systematic': 0,
  'Macro and Hard Assets': 0,
  'Disruptive Growth': 0,
};

const TIME_HORIZON_SCORES: Record<string, PhilosophyScores> = {
  long:      { 'Value and Patience': 2, 'Disruptive Growth': 2, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  medium:    { 'Value and Patience': 1, 'Disruptive Growth': 1, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  short:     { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 2 },
  undefined: { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
};

const MACRO_AWARENESS_SCORES: Record<string, PhilosophyScores> = {
  high:     { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 3, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  moderate: { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  low:      { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 1, 'Capital Preservation': 1 },
  none:     { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
};

const CONVICTION_DRIVER_SCORES: Record<string, PhilosophyScores> = {
  social:      { 'Value and Patience': 2, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
  thesis:      { 'Value and Patience': 0, 'Disruptive Growth': 2, 'Macro and Hard Assets': 3, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  analysis:    { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 3, 'Capital Preservation': 0 },
  instinct:    { 'Value and Patience': 0, 'Disruptive Growth': 3, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  adviser_led: { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 1, 'Capital Preservation': 3 },
};

const DESIRED_OUTCOME_SCORES: Record<string, PhilosophyScores> = {
  'Wants a clear starting point':                                                  { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 2, 'Capital Preservation': 0 },
  'Wants a framework for thinking about money':                                    { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 2, 'Capital Preservation': 0 },
  'Wants confirmation that current approach is sound':                             { 'Value and Patience': 2, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
  'Wants perspective on how their situation maps to a coherent philosophy':        { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 2, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
};

const LIFE_STAGE_SCORES: Record<string, PhilosophyScores> = {
  early_career: { 'Value and Patience': 0, 'Disruptive Growth': 2, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  mid_career:   { 'Value and Patience': 1, 'Disruptive Growth': 1, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  established:  { 'Value and Patience': 2, 'Disruptive Growth': 0, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 1, 'Capital Preservation': 1 },
};

const FRICTION_POINT_SCORES: Record<string, PhilosophyScores> = {
  'Knowledge gap is the primary blocker':                  { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  'Has conviction but no clear vehicle or starting point': { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  'Time and complexity crowd out action':                  { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  'No perceived urgency to change':                        { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
};

const ACTION_HISTORY_SCORES: Record<string, PhilosophyScores> = {
  inactive:      { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
  active:        { 'Value and Patience': 0, 'Disruptive Growth': 1, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  research_only: { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 1, 'Capital Preservation': 0 },
  new:           { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
};

const Q2_SCORES: Record<string, PhilosophyScores> = {
  A: { 'Value and Patience': 2, 'Disruptive Growth': 0, 'Macro and Hard Assets': 0, 'Rules-Based Systematic': 0, 'Capital Preservation': 1 },
  B: { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 2, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  C: { 'Value and Patience': 1, 'Disruptive Growth': 0, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
  D: { 'Value and Patience': 0, 'Disruptive Growth': 0, 'Macro and Hard Assets': 1, 'Rules-Based Systematic': 0, 'Capital Preservation': 0 },
};

function addScores(totals: PhilosophyScores, layer: PhilosophyScores | undefined): void {
  if (!layer) return;
  for (const key of PHILOSOPHIES) {
    totals[key] += layer[key] ?? 0;
  }
}

export function calculatePhilosophy(payload: VectorAnswerPayload): string {
  if (payload.adviserManaged) return 'Capital Preservation';
  if (payload.lifeStage === 'preservation') return 'Capital Preservation';

  const scores: PhilosophyScores = { ...ZERO_SCORES };

  addScores(scores, TIME_HORIZON_SCORES[payload.timeHorizon]);
  addScores(scores, MACRO_AWARENESS_SCORES[payload.macroAwareness]);
  addScores(scores, CONVICTION_DRIVER_SCORES[payload.convictionDriver]);
  addScores(scores, DESIRED_OUTCOME_SCORES[payload.desiredOutcome]);
  addScores(scores, LIFE_STAGE_SCORES[payload.lifeStage]);
  addScores(scores, FRICTION_POINT_SCORES[payload.frictionPoint]);
  addScores(scores, ACTION_HISTORY_SCORES[payload.actionHistory]);

  const q2 = payload.answers['q2' as keyof typeof payload.answers];
  if (q2) {
    addScores(scores, Q2_SCORES[q2]);
  }

  let best: typeof PHILOSOPHIES[number] = PHILOSOPHIES[0];
  let bestScore = scores[best];
  for (let i = 1; i < PHILOSOPHIES.length; i++) {
    const p = PHILOSOPHIES[i];
    if (scores[p] > bestScore) {
      best = p;
      bestScore = scores[p];
    }
  }

  return best;
}
