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
